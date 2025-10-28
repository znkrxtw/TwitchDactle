class Logic {

    constructor(game, ui) {
        this.game = game;
        this.ui = ui;

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
            for (let i = 0; i < this.game.guessedWords.length; i++) {
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

    selectArticlesStandard() {
        this.selectedArticles = 'standard';
        this.game.saveProgress();
    }

    selectArticlesCustom() {
        this.selectedArticles = 'custom';
        this.saveProgress();
    }

    getArticleName() {
        var e = document.getElementById("selectArticle");
        var value = e.value;
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
}