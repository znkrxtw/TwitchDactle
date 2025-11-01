class RedactleGame {

    constructor() {

        this.getReferences();

        // game state
        this.baffled = [];
        this.baffledNumbers = [];
        this.answer = [];
        this.ansStr = undefined;
        this.guessCounter = 0;

        this.currentlyHighlighted = undefined;

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

        this.ui = new UI(this);
        this.logic = new Logic(this);
        this.utility = new Utility();
        this.profileData = new ProfileData(this);
        this.wikiData = new WikiData(this);
        this.startUp = new StartUp(this, this.logic);

        this.init().then();
    }

    async init() {

        await this.profileData.loadSave(this);

        const articlesName = this.profileData.articleName;
        await this.wikiData.fetchData(true, articlesName);

        window.redactleGame = this;
    }

    getReferences() {
        // DOM references
        this.wikiHolder = document.getElementById("wikiHolder");
        this.guessLogBody = document.getElementById("guessLogBody");
        this.statLogBody = document.getElementById("statsTable");


        //guesses
        this.highlightedGuess = document.querySelectorAll('.highlighted');
        this.superHighlightedGuess = document.querySelectorAll('.superHighlighted');
        this.guessBody = document.querySelectorAll('#guessLogBody .table-secondary');
        this.userGuess = document.getElementById("userGuess");
    }
}

window.RedactleGame = new RedactleGame();