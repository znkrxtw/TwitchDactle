class Logic {

    constructor(game) {
        this.game = game;
        this.ui = game.ui;
        this.profileData = game.profileData;

        // expose methods on the game instance so existing callers keep working
        this.game.performGuess = (guessedWord, populate) => this.performGuess(guessedWord, populate);
        this.game.selectArticlesStandard = () => this.selectArticlesStandard();
        this.game.selectArticlesCustom = () => this.selectArticlesCustom();
    }

    performGuess(guessedWord, populate) {
        if (!this.game.gameIsActive) {
            return;
        }
        this.clickThruIndex = 0;
        this.ui.removeHighlights(false);
        const normGuess = guessedWord.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (commonWords.includes(normGuess)) {
            // do nothing
        } else {
            let alreadyGuessed = false;
            for (let i = 0; i < this.profileData.guessedWords.length; i++) {
                if (this.profileData.guessedWords[i][0] === normGuess) {
                    alreadyGuessed = true;
                }
            }
            if (!alreadyGuessed || populate) {
                let numHits = 0;
                for (let i = 0; i < this.game.baffled.length; i++) {
                    if (this.game.baffled[i][0] === normGuess) {
                        this.game.baffled[i][1].reveal();
                        this.game.baffled[i][1].elements[0].element.classList.remove("baffled");
                        this.game.baffled[i][1].elements[0].element.setAttribute("data-word", normGuess);
                        numHits += 1;
                        if (!populate) {
                            this.game.baffled[i][1].elements[0].element.classList.add("highlighted");
                            this.currentlyHighlighted = normGuess;
                        }
                    }
                }
                this.profileData.save.saveData.guessedWords = this.game.guessedWords;
                if (!populate) {
                    this.guessCounter += 1;
                    this.profileData.guessedWords.push([normGuess, numHits, this.guessCounter]);
                    this.profileData.saveProgress();
                }
                this.logGuess([normGuess, numHits, this.guessCounter], populate);
            } else {
                const guess = document.querySelector("tr[data-guess='" + normGuess + "']");
                guess.classList.add("table-secondary");
                guess[0].scrollIntoView();
                this.currentlyHighlighted = normGuess;
                document.querySelectorAll('.innerTxt').forEach(function () {
                    if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === normGuess) {
                        this.classList.add('highlighted');
                    }
                });
            }
            if (this.game.answer.includes(normGuess)) {
                this.game.answer = this.game.answer.filter(function (e) {
                    return e !== normGuess
                })
            }
            if (this.game.answer.length === 0) {
                this.winRound(populate);
            }
        }
    }

    selectArticlesStandard() {
        this.selectedArticles = 'standard';
        this.profileData.saveProgress();
    }

    selectArticlesCustom() {
        this.selectedArticles = 'custom';
        this.profileData.saveProgress();
    }

    buildStats() {
        for (let i = this.ui.statLogBody.rows.length - 1; i > 0; i--) {
            this.ui.statLogBody.deleteRow(i);
        }
        for (let i = 0; i < this.profileData.gameWins.length; i++) {
            if (this.profileData.gameWins[i] === 1) {
                this.ui.displayStats(i, this.profileData.gameAnswers[i], this.profileData.gameScores[i], this.profileData.gameAccuracy[i]);
            }
        }
    }

    getArticleName() {
        const value = document.getElementById("selectArticle").value;
        if (value === 'custom') {
            return customArticles[Math.floor(Math.random() * customArticles.length)];
        }
        return articles[Math.floor(Math.random() * articles.length)];
    }

    enterGuess(allGuesses, pluralizing) {
        if (pluralizing) {
            const pluralGuess = pluralize(allGuesses[0]);
            const singularGuess = pluralize.singular(allGuesses[0]);
            if (pluralGuess !== allGuesses[0]) allGuesses.push(pluralGuess);
            if (singularGuess !== allGuesses[0]) allGuesses.push(singularGuess);
        }
        for (let i = allGuesses.length - 1; i > -1; i--) {
            this.performGuess(allGuesses[i], false);
        }
    }

    logGuess(guess, populate) {
        if (this.profileData.hidingZero) {
            this.ui.hideZero();
        }
        let newRow = this.ui.guessLogBody.insertRow(0);
        newRow.class = 'curGuess';
        newRow.setAttribute('data-guess', guess[0]);
        if (!populate) {
            newRow.classList.add('table-secondary');
        }
        if (guess[1] > 0) {
            this.hitCounter += 1;
        }
        if (!this.profileData.pageRevealed) {
            this.currentAccuracy = ((this.hitCounter / this.profileData.guessedWords.length) * 100).toFixed(2);
        }
        if (guess[1] > 0) {
            newRow.addEventListener('click', (e) => {
                e.preventDefault();
                const inTxt = this.ui.getInnerTextFromRow(this, newRow, 1);
                const allInstances = this.ui.wikiHolder.querySelectorAll('[data-word="' + inTxt + '"]');
                if (this.currentlyHighlighted == null) {
                    this.clickThruIndex = 0;
                    this.currentlyHighlighted = inTxt;
                    newRow.classList.add('table-secondary');
                    document.querySelectorAll('.innerTxt').forEach( (element) => {
                        if (element.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === this.currentlyHighlighted) {
                            element.classList.add('highlighted');
                        }
                    });
                } else {
                    if (inTxt !== this.currentlyHighlighted) {
                        this.clickThruIndex = 0;
                        this.ui.removeHighlights(false);
                        newRow.classList.add('table-secondary');
                        document.querySelectorAll('.innerTxt').forEach((element) => {
                            if (element.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === inTxt) {
                                element.classList.add('highlighted');
                            }
                        })
                        this.currentlyHighlighted = inTxt;
                    }
                }
                document.querySelectorAll('.superHighlighted').forEach( (element) => {
                    element.classList.remove('superHighlighted');
                });
                allInstances[this.clickThruIndex % allInstances.length].classList.add('superHighlighted');
                allInstances[this.clickThruIndex % allInstances.length].scrollIntoView({
                    behavior: 'auto',
                    block: 'center',
                    inline: 'end'
                });
                this.clickThruIndex += 1;
            });
        } else {
            newRow.addEventListener('click', (e) => {
                this.ui.removeHighlights(true);
            });
        }
        newRow.innerHTML = '<td>' + guess[2] + '</td><td>' + guess[0] + '</td><td class="tableHits">' + guess[1] + '</td>';
        if (!populate) {
            newRow.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'end'
            });
        }
    }

    winRound(populate) {
        this.gameIsActive = false;
        this.ui.userGuess.disabled = true;
        const clap = new Audio('Clap.wav');
        clap.volume = 0.5;
        clap.addEventListener('canplaythrough', clap.play);
        confetti({
            scalar: 10,
            particleCount: 50,
            spread: 70,
            shapes: ["emoji", "image"],
            shapeOptions: {
                emoji: {
                    value: ["🍆", "💧", "💦", "🥵", "🍑"]
                }
            },
            origin: {y: 0.6}
        }).then(() => {
            this.ui.revealPage();
            if (!populate) {
                this.profileData.gameScores[this.profileData.redactleIndex] = this.profileData.guessedWords.length;
                this.profileData.gameAccuracy[this.profileData.redactleIndex] = this.currentAccuracy;
                this.profileData.gameAnswers[this.profileData.redactleIndex] = this.game.ansStr;
                this.profileData.gameWins[this.profileData.redactleIndex] = 1;
            }
        });
        let streakCount = 0;
        for (let i = this.profileData.gameWins.length; i > -1; i--) {
            if (this.profileData.gameWins[i] === 1) {
                streakCount += 1;
            }
            if (this.profileData.gameWins[i] === 0) {
                break;
            }
        }
    }
}