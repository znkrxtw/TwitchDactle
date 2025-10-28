class ProfileData {

    constructor(utility, logic, wikiData) {
        this.utility = utility;
        this.logic = logic;
        this.wikiData = wikiData;
        this.saveString = "redactleSave";
        this.save = {}

        this.playerId = null;
        this.redactleIndex = null;
        this.guessedWords = [];
        this.numbersRevealed = false;
        this.gameAccuracy = [];
        this.articleName = undefined;
        this.pageRevealed = false;
    }

    // ensure save structure exists and is normalized
    ensureSave() {
        if (!this.save) this.save = { saveData: {}, prefs: {}, id: {} };
        if (!this.save.saveData) this.save.saveData = {};
        if (!this.save.prefs) this.save.prefs = {};
        if (!this.save.id) this.save.id = {};
    }

    saveProgress(game) {
        this.ensureSave();
        this.save.saveData.redactleIndex = this.redactleIndex;
        this.save.saveData.articleName = this.articleName;
        this.save.saveData.guessedWords = this.guessedWords;
        this.save.saveData.numbersRevealed = this.numbersRevealed;
        this.save.saveData.pageRevealed = this.pageRevealed;
        this.initSave(game);
        localStorage.setItem(this.saveString, JSON.stringify(this.save));
    }

    async newGame(game) {
        localStorage.clear();
        this.save.saveData.redactleIndex += 1;
        this.save.saveData.articleName = this.logic.getArticleName();
        this.save.saveData.guessedWords = [];
        this.initSave(game);
        game.baffled = [];
        game.baffledNumbers = [];
        game.answer = [];
        game.guessCounter = 0;
        game.hitCounter = 0;
        game.currentAccuracy = -1;
        game.clickThruIndex = 0;
        game.clickThruNodes = [];
        this.save.saveData.numbersRevealed = false;
        this.save.saveData.pageRevealed = false;
        localStorage.setItem(this.saveString, JSON.stringify(this.save));
        document.querySelector("#guessLogBody").empty();
        document.getElementById("userGuess").disabled = false;

        await this.loadSave(game);
    }

    initSave(game) {
        this.save.saveData.gameWins = game.gameWins;
        this.save.saveData.gameScores = game.gameScores;
        this.save.saveData.gameAccuracy = game.gameAccuracy;
        this.save.saveData.prefs.hidingZero = game.hidingZero;
        this.save.saveData.prefs.selectedArticles = game.selectedArticles;
        this.save.saveData.prefs.hidingLog = game.hidingLog;
        this.save.saveData.prefs.streamName = game.streamName;
        this.save.saveData.prefs.pluralizing = window.pluralizing;
    }

    async loadSave(game) {
        if (localStorage.getItem(this.saveString) === null) {
            this.createNewSave(game)
        } else {
            this.save = JSON.parse(localStorage.getItem(this.saveString));
        }
        localStorage.setItem(this.saveString, JSON.stringify(this.save));

        this.playerID = this.save.id.playerID;
        this.articleName = this.save.saveData.articleName;
        game.hidingZero = this.save.prefs.hidingZero;
        game.hidingLog = this.save.prefs.hidingLog;
        game.selectedArticles = this.save.prefs.selectedArticles;
        window.pluralizing = this.save.prefs.pluralizing;
        game.streamName = this.save.prefs.streamName;
        game.redactleIndex = this.save.saveData.redactleIndex;
        game.gameWins = this.save.saveData.gameWins;
        game.gameScores = this.save.saveData.gameScores;
        game.gameAccuracy = this.save.saveData.gameAccuracy;
        game.gameAnswers = this.save.saveData.gameAnswers;
        const gameDelta = game.redactleIndex - this.save.saveData.gameWins.length;
        for (let i = 0; i < gameDelta; i++) {
            game.gameWins.push(0);
            game.gameScores.push(0);
            game.gameAccuracy.push(0);
            game.gameAnswers.push('');
        }

        this.guessedWords = this.save.saveData.guessedWords;
        this.numbersRevealed = this.save.saveData.numbersRevealed;
        this.pageRevealed = this.save.saveData.pageRevealed;

        this.saveProgress();

        await this.wikiData.fetchData(true, game.articleName);
    }

    createNewSave(game) {
        localStorage.clear();
        game.playerID = this.utility.uuidv4();
        game.articleName = this.logic.getArticleName();
        game.redactleIndex = 0;
        this.save = JSON.parse(JSON.stringify({
            "saveData": {
                redactleIndex: game.redactleIndex,
                articleName: game.articleName,
                guessedWords: game.guessedWords,
                gameWins: game.gameWins,
                gameScores: game.gameScores,
                gameAccuracy: game.gameAccuracy,
                gameAnswers: game.gameAnswers,
                numbersRevealed: game.numbersRevealed,
                pageRevealed: game.pageRevealed
            },
            "prefs": {
                hidingZero: game.hidingZero,
                hidingLog: game.hidingLog,
                pluralizing: window.pluralizing,
                selectedArticles: game.selectedArticles,
                streamName: game.streamName
            },
            "id": {playerID: game.playerID}
        }));
    }
}

