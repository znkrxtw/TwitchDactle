class StartUp {

    constructor(game, logic) {
        this.game = game;
        this.logic = logic;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init);

        } else {
            this.init();
        }
    }

    init() {

        const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
        const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
        const statsModal = new bootstrap.Modal(document.getElementById('statsModal'));
        const revealModal = new bootstrap.Modal(document.getElementById('revealModal'));

        const input = document.getElementById("userGuess");
        input.addEventListener("keyup", function (event) {
            if (event.keyCode === 13 && event.shiftKey) {
                event.preventDefault();
                const pluralizing = ($('#autoPlural').is(':checked') !== event.shiftKey);
                if (document.getElementById("userGuess").value.trim() !== '') {
                    const allGuesses = [document.getElementById("userGuess").value.replace(/\s/g, '')];
                    this.logic.enterGuess(allGuesses, pluralizing);
                }
                input.value = '';
            } else if (event.keyCode === 13) {
                const pluralizing = $('#autoPlural').is(':checked');
                if (document.getElementById("userGuess").value.trim() !== '') {
                    const allGuesses = [document.getElementById("userGuess").value.replace(/\s/g, '')];
                    this.logic.enterGuess(allGuesses, pluralizing);
                }
                input.value = '';
            }
        });

        document.getElementById("submitGuess").addEventListener("click", () => {
            if (document.getElementById("userGuess").value.trim() !== '') {
                const allGuesses = [document.getElementById("userGuess").value.replace(/\s/g, '')];
                const pluralizing = $('#autoPlural').is(':checked');
                this.logic.enterGuess(allGuesses, pluralizing);
            }
        });

        document.getElementById('hideZero').addEventListener('change', function () {
            if (this.checked) {
                this.ui.hideZero();
            } else {
                this.ui.showZero();
            }
            this.profileData.saveProgress();
        });

        document.getElementById('autoPlural').addEventListener('change', function () {
            this.game.pluralizing = this.checked;
            this.game.saveProgress(this.game);
        });

        document.getElementById('selectArticle').addEventListener('change', function () {
            this.game.selectedArticles = this.value === 'custom' ? 'custom' : 'standard';
            this.game.saveProgress(this.game);
        });

        document.getElementById('streamName').addEventListener('change', function () {
            this.game.streamName = this.value;
            this.game.saveProgress(this.game);
        });

        document.getElementById('statsBtn').addEventListener('click', function () {
            this.game.buildStats();
            statsModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        document.getElementById('settingsBtn').addEventListener('click', function () {
            settingsModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        document.getElementById('settingsBtn').addEventListener('click', function () {
            infoModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        document.getElementById('revealPageButton').addEventListener('click', function () {
            revealModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        document.getElementById('revealPageButton').addEventListener('click', function () {
            this.game.revealNumbers();
            this.profileData.saveProgress();
        });

        document.querySelectorAll('.closeInfo').forEach(function (el) {
            el.addEventListener('click', function () {
                infoModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        document.querySelectorAll('.closeSettings').forEach(function (el) {
            el.addEventListener('click', function () {
                settingsModal.hide();
                document.querySelector("body").style.overflow = "auto";
                self.connectStream();
                this.game.saveProgress();
            });
        });

        document.querySelectorAll('.closeStats').forEach(function (el) {
            el.addEventListener('click', function () {
                statsModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        document.querySelectorAll('.closeReveal').forEach(function (el) {
            el.addEventListener('click', function () {
                revealModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        document.querySelectorAll('.doReveal').forEach(function (el) {
            el.addEventListener('click', function () {
                this.game.winRound(false);
                revealModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        document.getElementById('backToTop').addEventListener('click', function () {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });

        document.getElementById('newGame').addEventListener('click', function () {
            this.profileData.newGame(this.game);
        });

        document.getElementById('hideNavBar').addEventListener('click', function () {
            const navBarHeight = document.getElementById('navBar');
            const navBarButton = document.getElementById('hideNavBar');
            if (navBarHeight.style.display !== "none") {
                navBarHeight.style.display = "none";
                navBarButton.text("v");
            } else {
                navBarHeight.style.display = "flex";
                navBarButton.text("^");
            }
        });

        window.onclick = function (event) {
            if (event.target === document.getElementById("infoModal")) {
                infoModal.hide();
                document.querySelector("body").style.overflow = "auto";
            }
            if (event.target === document.getElementById("settingsModal")) {
                settingsModal.hide();
                document.querySelector("body").style.overflow = "auto";
                connectStream();
            }
            if (event.target === document.getElementById("statsModal")) {
                statsModal.hide();
                document.querySelector("body").style.overflow = "auto";
            }
            if (event.target === document.getElementById("revealModal")) {
                revealModal.hide();
                document.querySelector("body").style.overflow = "auto";
            }
        };

        ComfyJS.onChat = (user, message) => {
            const firstWord = [message.split(' ')[0]];
            const pluralizing = $('#autoPlural').is(':checked');
            this.logic.enterGuess(firstWord, pluralizing);
        };

        ComfyJS.onCommand = (user, command) => {
            if (command === "next" && this.game.pageRevealed === true) {
                this.game.newGame();
            }
        };

        this.connectStream();
    }

    //TODO make this better
    connectStream() {
        if (this.game && this.game.save && this.game.save.prefs && this.game.save.prefs.streamName) {
            ComfyJS.Init(this.game.save.prefs.streamName);
        }
    }
}