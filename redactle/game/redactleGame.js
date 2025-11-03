class RedactleGame {

    constructor() {

        // game state
        this.baffled = [];
        this.baffledNumbers = [];
        this.answer = [];
        this.guessCounter = 0;
        this.ansStr = undefined;

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

        this.utility = new Utility();
        this.profileData = new ProfileData(this);
        this.logic = new Logic(this, this.ui, this.profileData);
        this.wikiData = new WikiData(this);
        this.startUp = new StartUp(this);

        this.init().then();
    }

    async init() {

        await this.profileData.loadSave(this);

        if(!this.profileData.articleName){
            this.profileData.articleName = this.logic.getArticleName();
        }

        await this.wikiData.fetchData(true, this.profileData.articleName);

        window.redactleGame = this;
    }
}

window.RedactleGame = new RedactleGame();