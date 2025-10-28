class StartUp {

    constructor(game, logic, wikiData) {
        this.game = game;
        this.logic = logic;
        this.wikiData = wikiData;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init);

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

        $('#hideZero').on('click', function () {
            if ($(this).is(':checked')) game.hideZero(); else game.showZero();
        });

        $('#hideLog').on('click', function () {
            if ($(this).is(':checked')) HideLog(); else ShowLog();
        });

        $('#hidePopup').on('click', function () {
            if ($(this).is(':checked')) HidePopup(); else ShowPopup();
        });

        $('#autoPlural').on('click', function () {
            game.pluralizing = $('#autoPlural').is(':checked');
            game.saveProgress();
        });

        $('#selectArticle').on("change", function () {
            game.selectedArticles = ($('#selectArticle').val() === 'custom') ? 'custom' : 'standard';
            game.saveProgress();
        });

        $('#streamName').on("change", function () {
            game.streamName = $('#streamName').val();
            game.saveProgress();
        });

        $("#statsBtn").click(function () {
            game.buildStats();
            statsModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        $("#settingsBtn").click(function () {
            settingsModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        $("#infoBtn").click(function () {
            infoModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        $("#revealPageButton").click(function () {
            revealModal.show();
            document.querySelector("body").style.overflow = "hidden";
        });

        $("#revealNumbersButton").click(function () {
            game.revealNumbers();
        });

        $(".closeInfo").each(function () {
            $(this).click(function () {
                infoModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        $(".closeSettings").each(function () {
            $(this).click(function () {
                settingsModal.hide();
                document.querySelector("body").style.overflow = "auto";
                connectStream();
                game.saveProgress();
            });
        });

        $(".closeStats").each(function () {
            $(this).click(function () {
                statsModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        $(".closeReveal").each(function () {
            $(this).click(function () {
                revealModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        $(".doReveal").each(function () {
            $(this).click(function () {
                game.winRound(false);
                revealModal.hide();
                document.querySelector("body").style.overflow = "auto";
            });
        });

        $("#backToTop").click(function () {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });

        $("#newGame").click(async function () {
            await this.profileData.newGame(this.game);
        });

        $("#hideNavBar").click(function () {
            const navBarHeight = $('#navBar');
            const navBarButton = $('#hideNavBar');
            if (navBarHeight.css("display") !== "none") {
                navBarHeight.css("display", "none");
                navBarButton.text("v");
            } else {
                navBarHeight.css("display", "flex");
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
            EnterGuess(firstWord, pluralizing);
        };

        ComfyJS.onCommand = (user, command) => {
            if (command === "next" && game.pageRevealed === true) {
                game.newGame();
            }
        };

        //connectStream();
    }

    connectStream() {
        if (game && game.save && game.save.prefs && game.save.prefs.streamName) {
            ComfyJS.Init(game.save.prefs.streamName);
        }
    }
}