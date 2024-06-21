var pluralizing;
var infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
var settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
var statsModal = new bootstrap.Modal(document.getElementById('statsModal'));
var revealModal = new bootstrap.Modal(document.getElementById('revealModal'));

window.onload = function () {
    var input = document.getElementById("userGuess");
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13 && event.shiftKey) {
            event.preventDefault();
            if ($('#autoPlural').is(':checked')) {
                pluralizing = false;
            } else {
                pluralizing = true;
            }
            document.getElementById("submitGuess").click();
            input.value = '';
        } else {
            if (event.keyCode === 13) {
                if ($('#autoPlural').is(':checked')) {
                    pluralizing = true;
                } else {
                    pluralizing = false;
                }
                document.getElementById("submitGuess").click();
                input.value = '';
            }
        }
    });

    $("#submitGuess").click(function () {
        if (!document.getElementById("userGuess").value == '' || !document.getElementById("userGuess").value == document.getElementById("userGuess").defaultValue) {
            var allGuesses = [document.getElementById("userGuess").value.replace(/\s/g, '')]

            EnterGuess(allGuesses);
        }
    });

    function EnterGuess(allGuesses) {

        if (pluralizing) {
            var pluralGuess = pluralize(allGuesses[0]);
            var singularGuess = pluralize.singular(allGuesses[0]);
            if (pluralGuess != allGuesses[0]) {
                allGuesses.push(pluralGuess);
            }
            if (singularGuess != allGuesses[0]) {
                allGuesses.push(singularGuess);
            }
        }
        for (var i = allGuesses.length - 1; i > -1; i--) {
            PerformGuess(allGuesses[i], false);
        }
        //pluralizing = false;
    }

    $(function () {
        $('#hideZero').click(function () {
            if ($('#hideZero').is(':checked')) {
                HideZero();
            } else {
                ShowZero();
            }
        });
    });

    $(function () {
        $('#hideLog').click(function () {
            if ($('#hideLog').is(':checked')) {
                HideLog();
            } else {
                ShowLog();
            }
        });
    });

    $(function () {
        $('#hidePopup').click(function () {
            if ($('#hidePopup').is(':checked')) {
                HidePopup();
            } else {
                ShowPopup();
            }
        });
    });

    $(function () {
        $('#autoPlural').click(function () {
            if ($('#autoPlural').is(':checked')) {
                pluralizing = true;
            } else {
                pluralizing = false;
            }
        });
    });

    $(function () {
        $('#selectArticle').on("change", function () {
            if ($('#selectArticle').val() === 'custom') {
                selectedArticles = 'custom';
            } else {
                selectedArticles = 'standard';
            }
        });
    });

    $(function () {
        $('#streamName').on("change", function () {
            streamName = $('#streamName').val();
            SaveProgress();
        });
    });

    $("#statsBtn").click(function () {
        BuildStats();
        statsModal.show();
        document.querySelector("body").style.overflow = "hidden";
    })

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
        revealNumbers();
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
            SaveProgress();
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
            //RevealPage();
            WinRound(false);
            revealModal.hide();
            document.querySelector("body").style.overflow = "auto";
        });
    });

    $("#backToTop").click(function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    $("#newGame").click(function () {
        newGame();
    });

    $("#hideNavBar").click(function () {
        let navBarHeight = $('#navBar');
        let navBarButton = $('#hideNavBar')
        if (navBarHeight.css("display") != "none") {
            navBarHeight.css("display", "none");
            navBarButton.text("v");
        }
        else {
            navBarHeight.css("display", "flex");
            navBarButton.text("^");
        }
    })

    window.onclick = function (event) {
        if (event.target == document.getElementById("infoModal")) {
            infoModal.hide();
            document.querySelector("body").style.overflow = "auto";
        }
        if (event.target == document.getElementById("settingsModal")) {
            settingsModal.hide();
            document.querySelector("body").style.overflow = "auto";
            connectStream();
        }
        if (event.target == document.getElementById("statsModal")) {
            statsModal.hide();
            document.querySelector("body").style.overflow = "auto";
        }
        if (event.target == document.getElementById("revealModal")) {
            revealModal.hide();
            document.querySelector("body").style.overflow = "auto";
        }
    };

    ComfyJS.onChat = (user, message, flags, self, extra) => {
        const firstWord = new Array(message.split(' ')[0]);
        EnterGuess(firstWord);
    };

    ComfyJS.onCommand = (user, command, message, flags, extra) => {
        if (command === "next" && pageRevealed === true) {
            newGame();
        }
    };

    function connectStream() {
        if (save.prefs.streamName) {
            ComfyJS.Init(save.prefs.streamName);
        }
    }

    connectStream();
}
