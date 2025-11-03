//TODO move this to redactleGame?
class StartUp {

    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.logic = game.logic;
        this.profileData = game.profileData;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
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
        input.addEventListener("keyup",  (event) => {
            if (event.key === "Enter" && event.shiftKey) {
                event.preventDefault();
                const pluralizing = (this.profileData.pluralizing !== event.shiftKey);
                if (input.value.trim() !== '') {
                    const allGuesses = [input.value.replace(/\s/g, '')];
                    this.logic.enterGuess(allGuesses, pluralizing);
                }
                input.value = '';
            } else if (event.key === "Enter") {
                if (input.value.trim() !== '') {
                    const allGuesses = [input.value.replace(/\s/g, '')];
                    this.logic.enterGuess(allGuesses, this.profileData.pluralizing);
                }
                input.value = '';
            }
        });

        document.getElementById("submitGuess").addEventListener("click", () => {
            if (document.getElementById("userGuess").value.trim() !== '') {
                const allGuesses = [document.getElementById("userGuess").value.replace(/\s/g, '')];
                this.logic.enterGuess(allGuesses, this.profileData.pluralizing);
            }
        });

        document.getElementById('hideZero').addEventListener('change',  (event) => {
            event.target.checked ? this.ui.hideZero(): this.ui.showZero();
            this.profileData.saveProgress();
        });

        document.getElementById('autoPlural').addEventListener('change', (event) => {
            this.game.pluralizing = event.target.checked;
            this.game.saveProgress(this.game);
        });

        document.getElementById('selectArticle').addEventListener('change', (event) => {
            this.game.selectedArticles = event.target.value === 'custom' ? 'custom' : 'standard';
            this.game.saveProgress(this.game);
        });

        document.getElementById('streamName').addEventListener('change', (event) => {
            this.game.streamName = event.target.value;
            this.game.saveProgress(this.game);
        });

        document.getElementById('infoBtn').addEventListener('click', () => {
            infoModal.show();
            document.body.style.overflow = "hidden";
        });

        document.getElementById('statsBtn').addEventListener('click', () => {
            this.logic.buildStats();
            statsModal.show();
            document.body.style.overflow = "hidden";
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            settingsModal.show();
            document.body.style.overflow = "hidden";
        });

        document.getElementById('revealPageButton').addEventListener('click', () => {
            revealModal.show();
            document.body.style.overflow = "hidden";
        });

        document.getElementById('revealNumbersButton').addEventListener('click', () => {
            this.game.revealNumbers();
            this.profileData.saveProgress();
        });

        document.querySelectorAll('.closeInfo').forEach((element) => {
            element.addEventListener('click',  () => {
                infoModal.hide();
                document.body.style.overflow = "auto";
            });
        });

        document.querySelectorAll('.closeSettings').forEach((element) => {
            element.addEventListener('click', () => {
                settingsModal.hide();
                document.body.style.overflow = "auto";
                this.connectStream();
                this.profileData.saveProgress();
            });
        });

        document.querySelectorAll('.closeStats').forEach(function (element) {
            element.addEventListener('click', function () {
                statsModal.hide();
                document.body.style.overflow = "auto";
            });
        });

        document.querySelectorAll('.closeReveal').forEach(function (element) {
            element.addEventListener('click', function () {
                revealModal.hide();
                document.body.style.overflow = "auto";
            });
        });

        document.querySelectorAll('.doReveal').forEach( (element) => {
            element.addEventListener('click', () => {
                this.game.winRound(false);
                revealModal.hide();
                document.body.style.overflow = "auto";
            });
        });

        document.getElementById('backToTop').addEventListener('click', function () {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });

        document.getElementById('newGame').addEventListener('click',  () => {
            this.profileData.newGame(this.game);
        });

        this.ui.navBarButton.addEventListener('click',  () => {
            this.ui.navBarBrand.classList.toggle('hidden');
            this.ui.navBarCollapse.classList.toggle('hidden');
            this.ui.navBarButtonContainer.classList.toggle('shrink');
            const isNavBarHidden = this.ui.navBar.classList.toggle('hidden');
            this.ui.navBarButton.innerText = isNavBarHidden ? "↓" : "↑";
        });

        window.onclick = (event) => {
            if (event.target === document.getElementById("infoModal")) {
                infoModal.hide();
                document.querySelector("body").style.overflow = "auto";
            }
            if (event.target === document.getElementById("settingsModal")) {
                settingsModal.hide();
                document.querySelector("body").style.overflow = "auto";
                this.connectStream();
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

    connectStream() {
        if (this.profileData.streamName) {
            ComfyJS.Init(this.profileData.streamName);
        }
    }
}