    RedactleGame.prototype.performGuess= function (guessedWord, populate) {
        if (!this.gameIsActive) {
            return;
        }
        this.clickThruIndex = 0;
        this.removeHighlights(false);
        var normGuess = guessedWord.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (commonWords.includes(normGuess)) {
            // do nothing
        }
        else {
            var alreadyGuessed = false;
            for (var i = 0; i < this.guessedWords.length; i++) {
                if (this.guessedWords[i][0] == normGuess) {
                    alreadyGuessed = true;
                }
            }
            if (!alreadyGuessed || populate) {
                var numHits = 0;
                for (var i = 0; i < this.baffled.length; i++) {
                    if (this.baffled[i][0] == normGuess) {
                        this.baffled[i][1].reveal();
                        this.baffled[i][1].elements[0].element.classList.remove("baffled");
                        this.baffled[i][1].elements[0].element.setAttribute("data-word", normGuess);
                        numHits += 1;
                        if (!populate) {
                            this.baffled[i][1].elements[0].element.classList.add("highlighted");
                            this.currentlyHighlighted = normGuess;
                        }
                    }
                }
                this.save.saveData.guessedWords = this.guessedWords;
                if (!populate) {
                    this.guessCounter += 1;
                    this.guessedWords.push([normGuess, numHits, this.guessCounter]);
                    this.saveProgress();
                }
                this.logGuess([normGuess, numHits, this.guessCounter], populate);
            } else {
                $("tr[data-guess='" + normGuess + "']").addClass("table-secondary");
                $("tr[data-guess='" + normGuess + "']")[0].scrollIntoView();
                this.currentlyHighlighted = normGuess;
                $('.innerTxt').each(function () {
                    if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == normGuess) {
                        this.classList.add('highlighted');
                    }
                });
            }
            if (this.answer.includes(normGuess)) {
                this.answer = this.answer.filter(function (e) { return e !== normGuess })
            }
            if (this.answer.length == 0) {
                this.winRound(populate);
            }
        }
    }

        RedactleGame.prototype.selectArticlesStandard = function () {
        this.selectedArticles = 'standard';
        this.saveProgress();
    }

    RedactleGame.prototype.selectArticlesCustom= function () {
        this.selectedArticles = 'custom';
        this.saveProgress();
    }

    RedactleGame.prototype.newGame= function () {
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