export function ProfileData(RedactleGame) {

    RedactleGame.prototype.saveProgress = function () {
        this.save.saveData.redactleIndex = this.redactleIndex;
        this.save.saveData.articleName = this.articleName;
        this.save.saveData.guessedWords = this.guessedWords;
        this.save.saveData.gameWins = this.gameWins;
        this.save.saveData.gameScores = this.gameScores;
        this.save.saveData.gameAccuracy = this.gameAccuracy;
        this.save.saveData.numbersRevealed = this.numbersRevealed;
        this.save.saveData.pageRevealed = this.pageRevealed;
        this.save.prefs.hidingZero = this.hidingZero;
        this.save.prefs.selectedArticles = this.selectedArticles;
        this.save.prefs.hidingLog = this.hidingLog;
        this.save.prefs.streamName = this.streamName;
        this.save.prefs.pluralizing = window.pluralizing;
        localStorage.setItem("redactleSavet", JSON.stringify(this.save));
    }

    RedactleGame.prototype.newGame = function () {
        localStorage.clear();
        this.save.saveData.redactleIndex += 1;
        this.save.saveData.articleName = this.getArticleName();
        this.save.saveData.guessedWords = [];
        this.save.saveData.gameWins = this.gameWins;
        this.save.saveData.gameScores = this.gameScores;
        this.save.saveData.gameAccuracy = this.gameAccuracy;
        this.save.prefs.hidingZero = this.hidingZero;
        this.save.prefs.selectedArticles = this.selectedArticles;
        this.save.prefs.hidingLog = this.hidingLog;
        this.save.prefs.streamName = this.streamName;
        this.save.prefs.pluralizing = window.pluralizing;
        this.baffled = [];
        this.baffledNumbers = [];
        this.answer = [];
        this.guessCounter = 0;
        this.hitCounter = 0;
        this.currentAccuracy = -1;
        this.pageRevealed = false;
        this.clickThruIndex = 0;
        this.clickThruNodes = [];
        this.save.saveData.numbersRevealed = false;
        this.save.saveData.pageRevealed = false;
        localStorage.setItem("redactleSavet", JSON.stringify(this.save));
        $("#guessLogBody").empty();
        document.getElementById("userGuess").disabled = false;

        this.loadSave();
    }

    RedactleGame.prototype.getArticleName = function () {
        var e = document.getElementById("selectArticle");
        var value = e.value;
        if (value === 'custom') {
            return customArticles[Math.floor(Math.random() * customArticles.length)];
        }
        return articles[Math.floor(Math.random() * articles.length)];
    }

    RedactleGame.prototype.loadSave = function () {
        if (localStorage.getItem("redactleSavet") === null) {
            localStorage.clear();
            this.playerID = this.uuidv4();
            this.articleName = this.getArticleName();
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
        } else {
            this.save = JSON.parse(localStorage.getItem("redactleSavet"));
        }
        localStorage.setItem("redactleSavet", JSON.stringify(this.save));

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
        var gameDelta = this.redactleIndex - this.save.saveData.gameWins.length;
        for (var i = 0; i < gameDelta; i++) {
            this.gameWins.push(0);
            this.gameScores.push(0);
            this.gameAccuracy.push(0);
            this.gameAnswers.push('');
        }

        this.guessedWords = this.save.saveData.guessedWords;
        this.numbersRevealed = this.save.saveData.numbersRevealed;
        this.pageRevealed = this.save.saveData.pageRevealed;

        this.saveProgress();

        this.fetchData(true, this.articleName);
    }
}

