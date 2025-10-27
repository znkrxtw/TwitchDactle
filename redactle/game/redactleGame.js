export class RedactleGame {
    constructor() {
        // DOM references
        this.wikiHolder = document.getElementById("wikiHolder");
        this.guessLogBody = document.getElementById("guessLogBody");
        this.statLogBody = document.getElementById("statsTable");

        // game state
        this.baffled = [];
        this.guessedWords = [];
        this.answer = [];
        this.ansStr = undefined;
        this.guessCounter = 0;
        this.hidingZero = false;
        this.hidingLog = false;
        this.selectedArticles = 'standard';
        this.streamName = "";
        this.currentlyHighlighted = undefined;
        this.gameWins = [];
        this.gameScores = [];
        this.gameAccuracy = [];
        this.gameAnswers = [];
        this.hitCounter = 0;
        this.currentAccuracy = -1;
        this.save = {};
        this.pageRevealed = false;
        this.clickThruIndex = 0;
        this.clickThruNodes = [];
        this.redirectable = undefined;
        this.conting = undefined;
        this.playerID = undefined;
        this.ses = undefined;
        this.redactleIndex = undefined;
        this.yesterday = undefined;
        this.articleName = undefined;
        this.loadingIcon = undefined;

        this.gameIsActive = false;
        this.numbersRevealed = false;
        this.baffledNumbers = [];
    }
}