class UI {

    constructor(game) {
        this.game = game;

        this.init();
    }

    init() {
        // DOM references
        this.wikiHolder = document.getElementById("wikiHolder");
        this.guessLogBody = document.getElementById("guessLogBody");
        this.statLogBody = document.getElementById("statsTable");

        //guesses
        this.highlightedGuess = document.querySelectorAll('.highlighted');
        this.superHighlightedGuess = document.querySelectorAll('.superHighlighted');
        this.guessBody = document.querySelectorAll('#guessLogBody .table-secondary');
        this.userGuess = document.getElementById("userGuess");

        this.navBarButton = document.getElementById('hideNavBarButton');
        this.navBarButtonContainer = document.getElementById('hideNavBarButtonContainer');
        this.navBar = document.getElementById('navBar');
        this.navBarBrand = document.getElementById('navbar-brand');
        this.navBarCollapse = document.getElementById('navbarNav');
    }


    removeHighlights(clearCur) {
        if (clearCur) {
            this.currentlyHighlighted = null;
        }

        this.highlightedGuess.forEach(function (el) {
            el.classList.remove('highlighted');
        });

        this.superHighlightedGuess.forEach(function (el) {
            el.classList.remove('superHighlighted');
        })

        this.guessBody.forEach( (element) => {
            element.classList.remove('table-secondary');
        })
    }

    // helper used in logGuess for robust retrieval (keeps logic isolated)
    getInnerTextFromRow(ctx, row, colIndex) {
        return row.getElementsByTagName('td')[colIndex].innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    emptyGuessBody() {
        this.guessBody.innerHTML = '';
    }

    revealPage() {
        this.removeHighlights(false);
        for (var i = 0; i < this.game.baffled.length; i++) {
            this.game.baffled[i][1].reveal();
            this.game.baffled[i][1].elements[0].element.classList.remove("baffled");
        }
        this.pageRevealed = true;
    }

    displayStats(index, gameAnswers, gameScores, gameAccuracy) {
        const statRow = this.statLogBody.insertRow(1);
        statRow.innerHTML = '<td>' + (index + 1) + '</td><td>' + gameAnswers[index] + '</td><td>' + gameScores[index] + '</td><td>' + gameAccuracy[index] + '%</td>';
    }

    hideZero() {
        this.hidingZero = true;
        document.querySelectorAll('.tableHits').forEach((el) => {
            if (el.innerHTML === '0') {
                el.parentElement.classList.add('hiddenRow');
            }
        });
    }

    showZero() {
        this.hidingZero = false;
        document.querySelectorAll('.hiddenRow').forEach((el) => {
            if (el.innerHTML === '0') {
                el.parentElement.classList.remove('hiddenRow');
            }
        });
    }

    revealNumbers() {
        this.numbersRevealed = true;
        for (let i = 0; i < this.baffledNumbers.length; i++) {
            this.baffledNumbers[i].reveal();
            this.baffledNumbers[i].elements[0].element.classList.remove("baffled");
            const dataWord = this.baffledNumbers[i].elements[0].value;
            this.baffledNumbers[i].elements[0].element.setAttribute("data-word", dataWord);
            if (this.game.answer.includes(dataWord)) {
                this.game.answer = this.answer.filter(function (e) {
                    return e !== dataWord
                })
            }
            if (this.game.answer.length === 0) {
                this.ui.winRound(true);
                break;
            }
        }
    }
}