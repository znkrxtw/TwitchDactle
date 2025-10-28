class RedactleGame {

    constructor() {
        // DOM references
        this.wikiHolder = document.getElementById("wikiHolder");
        this.guessLogBody = document.getElementById("guessLogBody");
        this.statLogBody = document.getElementById("statsTable");

        // game state
        this.baffled = [];
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

        this.gameAnswers = [];
        this.hitCounter = 0;
        this.currentAccuracy = -1;

        this.clickThruIndex = 0;
        this.clickThruNodes = [];
        this.redirectable = undefined;
        this.conting = undefined;
        this.ses = undefined;
        this.yesterday = undefined;

        this.loadingIcon = undefined;

        this.gameIsActive = false;

        this.baffledNumbers = [];

        this.ui = new UI();
        this.logic = new Logic(this, this.ui);
        this.utility = new Utility();
        this.wikiData = new WikiData(this);
        this.profileData = new ProfileData(this.utility, this.logic, this.wikiData);
        this.startUp = new StartUp(this, this.logic, this.wikiData);

        this.init().then();
    }

    async init() {

        await this.profileData.loadSave(this);

        this.startUp.init();

        window.redactleGame = this;
    }
}

window.RedactleGame = new RedactleGame();