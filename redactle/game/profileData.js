class ProfileData {

    constructor(game) {
        this.game = game;
        this.utility = game.utility;
        this.ui = game.ui;
        this.saveString = "redactleSave";
        this.save = {}

        //save data
        this.playerID = null;
        this.redactleIndex = null;
        this.guessedWords = [];
        this.numbersRevealed = false;
        this.gameAccuracy = [];
        this.articleName = undefined;
        this.pageRevealed = false;
        this.gameWins = [];
        this.gameScores = [];
        this.gameAnswers = [];

        //save prefs
        this.hidingZero = false;
        this.hidingLog = false;
        this.selectedArticles = 'standard';
        this.streamName = '';
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

    newGame() {
        localStorage.clear();
        this.save.saveData.redactleIndex += 1;
        this.save.saveData.articleName = "";
        this.save.saveData.guessedWords = [];
        this.initSave();
        this.game.baffled = [];
        this.game.baffledNumbers = [];
        this.game.answer = [];
        this.game.guessCounter = 0;
        this.game.hitCounter = 0;
        this.game.currentAccuracy = -1;
        this.game.clickThruIndex = 0;
        this.game.clickThruNodes = [];
        this.save.saveData.numbersRevealed = false;
        this.save.saveData.pageRevealed = false;
        localStorage.setItem(this.saveString, JSON.stringify(this.save));
        this.ui.emptyGuessBody();

        document.getElementById("userGuess").disabled = false;

        this.loadSave();
    }

    initSave() {
        this.save.saveData.gameWins = this.gameWins;
        this.save.saveData.gameScores = this.gameScores;
        this.save.saveData.gameAccuracy = this.gameAccuracy;
        this.save.prefs.hidingZero = this.hidingZero;
        this.save.prefs.selectedArticles = this.selectedArticles;
        this.save.prefs.hidingLog = this.hidingLog;
        this.save.prefs.streamName = this.streamName;
        this.save.prefs.pluralizing = window.pluralizing;
    }

    loadSave() {
        if (localStorage.getItem(this.saveString) === null) {
            this.createNewSave()
        } else {
            this.save = JSON.parse(localStorage.getItem(this.saveString));
        }
        localStorage.setItem(this.saveString, JSON.stringify(this.save));

        this.playerID = this.save.id.playerID;
        this.articleName = this.save.saveData.articleName;
        this.hidingZero = this.save.prefs.hidingZero;
        this.hidingLog = this.save.prefs.hidingLog;
        this.selectedArticles = this.save.prefs.selectedArticles;
        window.pluralizing = this.save.prefs.pluralizing;
        this.streamName = this.save.prefs.streamName;
        this.redactleIndex = this.save.saveData.redactleIndex;
        this.gameWins = this.save.saveData.gameWins;
        this.gameScores = this.save.saveData.gameScores;
        this.gameAccuracy = this.save.saveData.gameAccuracy;
        this.gameAnswers = this.save.saveData.gameAnswers;
        const gameDelta = this.redactleIndex - this.save.saveData.gameWins.length;
        for (let i = 0; i < gameDelta; i++) {
            this.gameWins.push(0);
            this.gameScores.push(0);
            this.gameAccuracy.push(0);
            this.gameAnswers.push('');
        }

        this.guessedWords = this.save.saveData.guessedWords;
        this.numbersRevealed = this.save.saveData.numbersRevealed;
        this.pageRevealed = this.save.saveData.pageRevealed;

        this.saveProgress();
    }

    createNewSave() {
        localStorage.clear();
        this.playerID = this.utility.uuidv4();
        this.articleName = "";
        this.redactleIndex = 0;
        this.save = JSON.parse(JSON.stringify({
            "saveData": {
                redactleIndex: this.redactleIndex,
                articleName: this.articleName,
                guessedWords: this.guessedWords,
                gameWins: this.gameWins,
                gameScores: this.gameScores,
                gameAccuracy: this.gameAccuracy,
                gameAnswers: this.gameAnswers,
                numbersRevealed: this.numbersRevealed,
                pageRevealed: this.pageRevealed
            },
            "prefs": {
                hidingZero: this.hidingZero,
                hidingLog: this.hidingLog,
                pluralizing: window.pluralizing,
                selectedArticles: this.selectedArticles,
                streamName: this.streamName
            },
            "id": {playerID: this.playerID}
        }));
    }
}

