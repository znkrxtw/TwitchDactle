export function Logic(RedactleGame) {

    RedactleGame.prototype.performGuess = function (guessedWord, populate) {
        if (!this.gameIsActive) {
            return;
        }
        this.clickThruIndex = 0;
        this.removeHighlights(false);
        const normGuess = guessedWord.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (commonWords.includes(normGuess)) {
            // do nothing
        } else {
            let alreadyGuessed = false;
            for (let i = 0; i < this.guessedWords.length; i++) {
                if (this.guessedWords[i][0] === normGuess) {
                    alreadyGuessed = true;
                }
            }
            if (!alreadyGuessed || populate) {
                let numHits = 0;
                for (let i = 0; i < this.baffled.length; i++) {
                    if (this.baffled[i][0] === normGuess) {
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
                const guess = $("tr[data-guess='" + normGuess + "']");
                guess.addClass("table-secondary");
                guess[0].scrollIntoView();
                this.currentlyHighlighted = normGuess;
                $('.innerTxt').each(function () {
                    if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === normGuess) {
                        this.classList.add('highlighted');
                    }
                });
            }
            if (this.answer.includes(normGuess)) {
                this.answer = this.answer.filter(function (e) {
                    return e !== normGuess
                })
            }
            if (this.answer.length === 0) {
                this.winRound(populate);
            }
        }
    }

    RedactleGame.prototype.selectArticlesStandard = function () {
        this.selectedArticles = 'standard';
        this.saveProgress();
    }

    RedactleGame.prototype.selectArticlesCustom = function () {
        this.selectedArticles = 'custom';
        this.saveProgress();
    }


}