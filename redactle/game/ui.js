class UI {

    constructor() {

    }

    removeHighlights(clearCur) {
        if (clearCur) {
            this.currentlyHighlighted = null;
        }

        document.querySelectorAll('.highlighted').forEach(function (el) {
            el.classList.remove('highlighted');
        });

        document.querySelectorAll('.superHighlighted').forEach(function (el) {
            el.classList.remove('superHighlighted');
        })

        document.querySelectorAll('#guessLogBody .table-secondary').forEach(function (el) {
            el.classList.remove('table-secondary');
        })
    }

    // helper used in logGuess for robust retrieval (keeps logic isolated)
    getInnerTextFromRow(ctx, row, colIndex) {
        return row.getElementsByTagName('td')[colIndex].innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    winRound(populate) {
        this.gameIsActive = false;
        document.getElementById("userGuess").disabled = true;
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
            this.revealPage();
            if (!populate) {
                this.gameScores[this.redactleIndex] = this.guessedWords.length;
                this.gameAccuracy[this.redactleIndex] = this.currentAccuracy;
                this.gameAnswers[this.redactleIndex] = this.ansStr;
                this.gameWins[this.redactleIndex] = 1;
            }
        });
        let streakCount = 0;
        for (let i = this.gameWins.length; i > -1; i--) {
            if (this.gameWins[i] === 1) {
                streakCount += 1;
            }
            if (this.gameWins[i] === 0) {
                break;
            }
        }

        this.saveProgress();
    }

    shareResults() {
        const shareText = "I solved today's Redactle (#" + (this.redactleIndex + 1) + ") in " + this.gameScores[this.redactleIndex] + " guesses with an accuracy of " + this.currentAccuracy + "%. Played at https://www.redactle.com/";
        const copied = ClipboardJS.copy(shareText);
        if (copied) {
            alert("Results copied to clipboard. Thanks for playing!");
        } else {
            alert("Something went wrong trying to copy results to clipboard.");
        }
    }

    revealPage() {
        this.removeHighlights(false);
        for (var i = 0; i < this.baffled.length; i++) {
            this.baffled[i][1].reveal();
            this.baffled[i][1].elements[0].element.classList.remove("baffled");
        }
        this.pageRevealed = true;

        this.saveProgress();
    }

    buildStats() {
        for (let i = this.statLogBody.rows.length - 1; i > 0; i--) {
            this.statLogBody.deleteRow(i);
        }
        for (let i = 0; i < this.gameWins.length; i++) {
            if (this.gameWins[i] === 1) {
                const statRow = this.statLogBody.insertRow(1);
                statRow.innerHTML = '<td>' + (i + 1) + '</td><td>' + this.gameAnswers[i] + '</td><td>' + this.gameScores[i] + '</td><td>' + this.gameAccuracy[i] + '%</td>';
            }
        }
    }

    hideZero() {
        this.hidingZero = true;
        this.saveProgress();
        $('.tableHits').each(function () {
            if (this.innerHTML === '0') {
                $(this).parent().addClass('hiddenRow');
            }
        });
    }

    showZero() {
        this.hidingZero = false;
        this.saveProgress();
        $('.hiddenRow').each(function () {
            $(this).removeClass('hiddenRow');
        });
    }

    revealNumbers() {
        this.numbersRevealed = true;
        for (let i = 0; i < this.baffledNumbers.length; i++) {
            this.baffledNumbers[i].reveal();
            this.baffledNumbers[i].elements[0].element.classList.remove("baffled");
            const dataWord = this.baffledNumbers[i].elements[0].value;
            this.baffledNumbers[i].elements[0].element.setAttribute("data-word", dataWord);
            if (this.answer.includes(dataWord)) {
                this.answer = this.answer.filter(function (e) {
                    return e !== dataWord
                })
            }
            if (this.answer.length === 0) {
                this.winRound(true);
                break;
            }
        }
        this.saveProgress();
    }

    logGuess(guess, populate) {
        if (this.hidingZero) {
            this.hideZero();
        }
        var newRow = this.guessLogBody.insertRow(0);
        newRow.class = 'curGuess';
        newRow.setAttribute('data-guess', guess[0]);
        if (!populate) {
            newRow.classList.add('table-secondary');
        }
        if (guess[1] > 0) {
            this.hitCounter += 1;
        }
        if (!this.pageRevealed) {
            this.currentAccuracy = ((this.hitCounter / this.guessedWords.length) * 100).toFixed(2);
        }
        if (guess[1] > 0) {
            $(newRow).on('click', (e) => {
                e.preventDefault();
                const inTxt = this.getInnerTextFromRow(this, newRow, 1);
                const allInstances = this.wikiHolder.querySelectorAll('[data-word="' + inTxt + '"]');
                if (this.currentlyHighlighted == null) {
                    this.clickThruIndex = 0;
                    this.currentlyHighlighted = inTxt;
                    newRow.classList.add('table-secondary');
                    $('.innerTxt').each(function () {
                        if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === this.currentlyHighlighted) {
                            $(this).addClass('highlighted');
                        }
                    });
                } else {
                    if (inTxt === this.currentlyHighlighted) {

                    } else {
                        this.clickThruIndex = 0;
                        this.removeHighlights(false);
                        newRow.classList.add('table-secondary');
                        $('.innerTxt').each(() => {
                            if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() === inTxt) {
                                this.classList.add('highlighted');
                            }
                        })
                        this.currentlyHighlighted = inTxt;
                    }
                }
                $('.superHighlighted').each(function () {
                    this.classList.remove('superHighlighted');
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
            $(newRow).on('click', (e) => {
                this.removeHighlights(true);
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
}