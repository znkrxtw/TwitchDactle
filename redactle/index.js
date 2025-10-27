class RedactleGame {
    constructor() {
        // DOM references
        this.wikiHolder = document.getElementById("wikiHolder");
        this.guessLogBody = document.getElementById("guessLogBody");
        this.statLogBody = document.getElementById("statsTable");

        // game state
        this.baffled = [];
        this.guessedWords = [];
        this.answer = [];
        this.ansStr = undefined;
        this.guessCounter = 0;
        this.hidingZero = false;
        this.hidingLog = false;
        this.selectedArticles = 'standard';
        this.streamName = "";
        this.currentlyHighlighted = undefined;
        this.gameWins = [];
        this.gameScores = [];
        this.gameAccuracy = [];
        this.gameAnswers = [];
        this.hitCounter = 0;
        this.currentAccuracy = -1;
        this.save = {};
        this.pageRevealed = false;
        this.clickThruIndex = 0;
        this.clickThruNodes = [];
        this.redirectable = undefined;
        this.conting = undefined;
        this.playerID = undefined;
        this.ses = undefined;
        this.redactleIndex = undefined;
        this.yesterday = undefined;
        this.articleName = undefined;
        this.loadingIcon = undefined;

        this.gameIsActive = false;
        this.numbersRevealed = false;
        this.baffledNumbers = [];
    }

    uuidv4() {
        return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    median(numbers) {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);

        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }

        return sorted[middle];
    }

    average(array) {
        return array.reduce((a, b) => a + b) / array.length;
    }

    loadSave() {
        if (localStorage.getItem("redactleSavet") === null) {
            localStorage.clear();
            this.playerID = this.uuidv4();
            this.articleName = this.getArticleName();
            this.redactleIndex = 0;
            this.save = JSON.parse(JSON.stringify({
                "saveData": { redactleIndex: this.redactleIndex, articleName: this.articleName, guessedWords: this.guessedWords, gameWins: this.gameWins, gameScores: this.gameScores, gameAccuracy: this.gameAccuracy, gameAnswers: this.gameAnswers, numbersRevealed: this.numbersRevealed, pageRevealed: this.pageRevealed },
                "prefs": { hidingZero: this.hidingZero, hidingLog: this.hidingLog, pluralizing: window.pluralizing, selectedArticles: this.selectedArticles, streamName: this.streamName },
                "id": { playerID: this.playerID }
            }));
        } else {
            this.save = JSON.parse(localStorage.getItem("redactleSavet"));
        }
        localStorage.setItem("redactleSavet", JSON.stringify(this.save));

        this.playerID = this.save.id.playerID;
        this.articleName = this.save.saveData.articleName;
        this.hidingZero = this.save.prefs.hidingZero;
        this.hidingLog = this.save.prefs.hidingLog;
        this.selectedArticles = this.save.prefs.selectedArticles;
        window.pluralizing = this.save.prefs.pluralizing;
        this.streamName = this.save.prefs.streamName;
        this.redactleIndex = this.save.saveData.redactleIndex;
        this.gameWins = this.save.saveData.gameWins;
        this.gameScores = this.save.saveData.gameScores;
        this.gameAccuracy = this.save.saveData.gameAccuracy;
        this.gameAnswers = this.save.saveData.gameAnswers;
        var gameDelta = this.redactleIndex - this.save.saveData.gameWins.length;
        for (var i = 0; i < gameDelta; i++) {
            this.gameWins.push(0);
            this.gameScores.push(0);
            this.gameAccuracy.push(0);
            this.gameAnswers.push('');
        }

        this.guessedWords = this.save.saveData.guessedWords;
        this.numbersRevealed = this.save.saveData.numbersRevealed;
        this.pageRevealed = this.save.saveData.pageRevealed;

        this.saveProgress();

        this.fetchData(true, this.articleName);
    }

    async fetchData(retry, artStr) {
        const article = retry ? artStr : atob(artStr);
        return await fetch('https://en.wikipedia.org/w/api.php?action=parse&format=json&page=' + article + '&prop=text&formatversion=2&origin=*')
            .then(resp => {
                if (!resp.ok) {
                    throw `Server error: [${resp.status}] [${resp.statusText}] [${resp.url}]`;
                }
                return resp.json();
            })
            .then(receivedJson => {
                this.conting = true;
                var cleanText = receivedJson.parse.text.replace(/<img[^>]*>/g, "").replace(/\<small\>/g, '').replace(/\<\/small\>/g, '').replace(/–/g, '-').replace(/<audio.*<\/audio>/g, "");
                this.wikiHolder.style.display = "none";
                this.wikiHolder.innerHTML = cleanText;
                var redirecting = document.getElementsByClassName('redirectMsg');
                if (redirecting.length > 0) {
                    var redirURL = $('.redirectText')[0].firstChild.firstChild.innerHTML.replace(/ /g, "_");
                    this.conting = false;
                    this.fetchData(!this.conting, redirURL);
                }
                if (this.conting) {
                    let seeAlso;
                    if (document.getElementById("See_also") != null) {
                        seeAlso = document.getElementById("See_also").parentNode;
                    } else if (document.getElementById("Notes") != null) {
                        seeAlso = document.getElementById("Notes").parentNode;
                    } else if (document.getElementById("References") != null) {
                        seeAlso = document.getElementById("References").parentNode;
                    }
                    var e = document.getElementsByClassName('mw-parser-output');
                    if (seeAlso) {
                        const alsoIndex = Array.prototype.indexOf.call(seeAlso.parentNode.children, seeAlso);
                        for (var i = alsoIndex; i < e[0].children.length; i++) {
                            e[0].removeChild(e[0].children[i]);
                        }
                    }
                    var all_bad_elements = this.wikiHolder.querySelectorAll("[rel='mw-deduplicated-inline-style'], [title='Name at birth'], [aria-labelledby='micro-periodic-table-title'], .barbox, .wikitable, .clade, .Expand_section, .nowrap, .IPA, .thumb, .mw-empty-elt, .mw-editsection, .nounderlines, .nomobile, .searchaux, #toc, .sidebar, .sistersitebox, .noexcerpt, #External_links, #Further_reading, .hatnote, .haudio, .portalbox, .mw-references-wrap, .infobox, .unsolved, .navbox, .metadata, .refbegin, .reflist, .mw-stack, #Notes, #References, .reference, .quotebox, .collapsible, .uncollapsed, .mw-collapsible, .mw-made-collapsible, .mbox-small, .mbox, #coordinates, .succession-box, .noprint, .mwe-math-element, .cs1-ws-icon");

                    for (var i = 0; i < all_bad_elements.length; i++) {
                        all_bad_elements[i].remove();
                    }

                    var b = document.getElementsByTagName('b');
                    while (b.length) {
                        var parent = b[0].parentNode;
                        while (b[0].firstChild) {
                            parent.insertBefore(b[0].firstChild, b[0]);
                        }
                        parent.removeChild(b[0]);
                    }
                    var a = this.wikiHolder.getElementsByTagName('a');
                    while (a.length) {
                        var parent = a[0].parentNode;
                        while (a[0].firstChild) {
                            parent.insertBefore(a[0].firstChild, a[0]);
                        }
                        parent.removeChild(a[0]);
                    }
                    var bq = document.getElementsByTagName('blockquote');
                    for (var i = 0; i < bq.length; i++) {
                        bq[i].innerHTML = bq[i].innerHTML.replace(/<[^>]*>?/gm, '');
                    }
                    var s = document.getElementsByTagName('sup')
                    while (s.length) {
                        s[0].remove();
                    }
                    var ex = document.getElementsByClassName('excerpt');
                    while (ex.length) {
                        ex[0].remove();
                    }
                    $(e[0]).find('[title]').each(function () {
                        this.removeAttribute('title');
                    })
                    $(e[0]).find('.mw-headline').contents().unwrap();
                    var titleHolder = document.createElement("h1");
                    var titleTxt = article.replace(/_/g, ' ');
                    titleHolder.innerHTML = titleTxt;
                    e[0].prepend(titleHolder);
                    this.ansStr = titleTxt.replace(/ *\([^)]*\) */g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    this.answer = this.ansStr.match(/\b(\w+'\w+|\w+)\b/g);
                    this.answer = this.answer.filter(function (el) {
                        return commonWords.indexOf(el) < 0;
                    });
                    e[0].innerHTML = e[0].innerHTML.replace(/\(; /g, '(').replace(/\(, /g, '(').replace(/\(, /g, '(').replace(/: ​;/g, ';').replace(/ \(\) /g, ' ').replace(/<\/?span[^>]*>/g, "");
                    ;
                    $(e[0]).find('*').removeAttr('class').removeAttr('style');

                    $(e[0]).find("p, blockquote, h1, h2, table, li, i, cite, span").contents().filter(function (i, el) {
                        return el.nodeType === 3;
                    }).each(function (i, el) {
                        var $el = $(el);
                        var replaced = $el.text().replace(/([\.,:()\[\]?!;`\~\-\u2013\—&*"])/g, '<span class="punctuation">$1</span>');
                        el.replaceWith(replaced);
                    });

                    e[0].innerHTML = e[0].innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/(<style.*<\/style>)/g, "").replace(/(<span class="punctuation">.<\/span>)|(^|<\/?[^>]+>|\s+)|([^\s<]+)/g, '$1$2<span class="innerTxt">$3</span>').replace('<<span class="innerTxt">h1>', '<h1><span class="innerTxt">');
                    $(e[0]).find('*:empty').remove();
                    this.wikiHolder.innerHTML = this.wikiHolder.innerHTML.replace(/<!--(?!>)[\S\s]*?-->/g, '');

                    // make the check for rejection here
                    // repackage the words into a text and send it to rejectArticle
                    // (i'm too lazy to do it properly, !thisisfine)
                    var cleanerText = [...this.wikiHolder.getElementsByClassName("innerTxt")].reduce((text, item) => text + ' ' + item.textContent, "");
                    if (rejectArticle(cleanerText)) {
                        // the article must be skipped
                        // wait 2 seconds and start a new game
                        console.log("Skipping the article " + this.articleName);
                        setTimeout(() => this.newGame(), 2000);
                        return;
                    }

                    this.gameIsActive = true;

                    $(".mw-parser-output span").not(".punctuation").each((i, el) => {
                        var txt = el.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        if (!commonWords.includes(txt)) {
                            el.classList.toggle('baffled');
                            el.setAttribute('word-length', txt.length);
                            let b = baffle(el).once().set({ characters: 'abcd' });
                            this.baffled.push([txt, b]);
                            if (!isNaN(txt)) {
                                this.baffledNumbers.push(b);
                            }
                        }
                    });

                    if (this.guessedWords.length > 0) {
                        for (var i = 0; i < this.guessedWords.length; i++) {
                            this.guessCounter += 1;
                            this.performGuess(this.guessedWords[i][0], true);
                        }
                    }
                    if (this.numbersRevealed) {
                        this.revealNumbers();
                    }

                    if (window.pluralizing) {
                        document.getElementById("autoPlural").checked = true;
                    } else {
                        document.getElementById("autoPlural").checked = false;
                    }

                    if (this.hidingZero) {
                        document.getElementById("hideZero").checked = true;
                        this.hideZero();
                    } else {
                        document.getElementById("hideZero").checked = false;
                        this.showZero();
                    }

                    if (this.selectedArticles === 'custom') {
                        document.getElementById("selectArticle").value = 'custom';
                        this.selectArticlesCustom();
                    } else {
                        document.getElementById("selectArticle").value = 'standard';
                        this.selectArticlesStandard();
                    }

                    document.getElementById("streamName").value = this.streamName;

                    if (this.pageRevealed) {
                        this.winRound(true);
                    }

                    this.wikiHolder.style.display = "flex";
                }
            })
            .catch(err => {
                console.error("Error in fetch", err);
                alert("Something went wrong while loading the page. Try refreshing.");
            });
    }

    performGuess(guessedWord, populate) {
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
                var inTxt = this.getInnerTextFromRow(this, newRow, 1);
                var allInstances = this.wikiHolder.querySelectorAll('[data-word="' + inTxt + '"]');
                if (this.currentlyHighlighted == null) {
                    this.clickThruIndex = 0;
                    this.currentlyHighlighted = inTxt;
                    newRow.classList.add('table-secondary');
                    $('.innerTxt').each(function () {
                        if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == this.currentlyHighlighted) {
                            $(this).addClass('highlighted');
                        }
                    });
                } else {
                    if (inTxt == this.currentlyHighlighted) {

                    } else {
                        this.clickThruIndex = 0;
                        this.removeHighlights(false);
                        newRow.classList.add('table-secondary');
                        $('.innerTxt').each(() => {
                            if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == inTxt) {
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

    // helper used in logGuess for robust retrieval (keeps logic isolated)
    getInnerTextFromRow(ctx, row, colIndex) {
        return row.getElementsByTagName('td')[colIndex].innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    winRound(populate) {
        this.gameIsActive = false;
        document.getElementById("userGuess").disabled = true;
        if (true) {
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
                origin: { y: 0.6 }
            });
            this.revealPage();
            if (!populate) {
                this.gameScores[this.redactleIndex] = this.guessedWords.length;
                this.gameAccuracy[this.redactleIndex] = this.currentAccuracy;
                this.gameAnswers[this.redactleIndex] = this.ansStr;
                this.gameWins[this.redactleIndex] = 1;
            }
        }
        var streakCount = 0;
        for (var i = this.gameWins.length; i > -1; i--) {
            if (this.gameWins[i] == 1) {
                streakCount += 1;
            }
            if (this.gameWins[i] == 0) {
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
        }
        else {
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
        for (var i = this.statLogBody.rows.length - 1; i > 0; i--) {
            this.statLogBody.deleteRow(i);
        }
        for (var i = 0; i < this.gameWins.length; i++) {
            if (this.gameWins[i] == 1) {
                var statRow = this.statLogBody.insertRow(1);
                statRow.innerHTML = '<td>' + (i + 1) + '</td><td>' + this.gameAnswers[i] + '</td><td>' + this.gameScores[i] + '</td><td>' + this.gameAccuracy[i] + '%</td>';
            }
        }
    }

    hideZero() {
        this.hidingZero = true;
        this.saveProgress();
        $('.tableHits').each(function () {
            if (this.innerHTML == '0') {
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

    selectArticlesStandard() {
        this.selectedArticles = 'standard';
        this.saveProgress();
    }

    selectArticlesCustom() {
        this.selectedArticles = 'custom';
        this.saveProgress();
    }

    removeHighlights(clearCur) {
        if (clearCur) {
            this.currentlyHighlighted = null;
        }
        $('.highlighted').each(function () {
            $(this).removeClass('highlighted');
        });
        $('.superHighlighted').each(function () {
            this.classList.remove('superHighlighted');
        });
        $('#guessLogBody').find('.table-secondary').each(function () {
            this.classList.remove('table-secondary');
        })
    }

    saveProgress() {
        this.save.saveData.redactleIndex = this.redactleIndex;
        this.save.saveData.articleName = this.articleName;
        this.save.saveData.guessedWords = this.guessedWords;
        this.save.saveData.gameWins = this.gameWins;
        this.save.saveData.gameScores = this.gameScores;
        this.save.saveData.gameAccuracy = this.gameAccuracy;
        this.save.saveData.numbersRevealed = this.numbersRevealed;
        this.save.saveData.pageRevealed = this.pageRevealed;
        this.save.prefs.hidingZero = this.hidingZero;
        this.save.prefs.selectedArticles = this.selectedArticles;
        this.save.prefs.hidingLog = this.hidingLog;
        this.save.prefs.streamName = this.streamName;
        this.save.prefs.pluralizing = window.pluralizing;
        localStorage.setItem("redactleSavet", JSON.stringify(this.save));
    }

    newGame() {
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

    getArticleName() {
        var e = document.getElementById("selectArticle");
        var value = e.value;
        if (value === 'custom') {
            return customArticles[Math.floor(Math.random() * customArticles.length)];
        }
        return articles[Math.floor(Math.random() * articles.length)];
    }

    revealNumbers() {
        this.numbersRevealed = true;
        for (var i = 0; i < this.baffledNumbers.length; i++) {
            this.baffledNumbers[i].reveal();
            this.baffledNumbers[i].elements[0].element.classList.remove("baffled");
            var dataWord = this.baffledNumbers[i].elements[0].value;
            this.baffledNumbers[i].elements[0].element.setAttribute("data-word", dataWord);
            if (this.answer.includes(dataWord)) {
                this.answer = this.answer.filter(function (e) { return e !== dataWord })
            }
            if (this.answer.length == 0) {
                this.winRound(true);
                break;
            }
        }
        this.saveProgress();
    }
}

// instantiate and expose a single game instance
const game = new RedactleGame();
game.loadSave();

// also expose instance for debugging if needed
window.redactleGame = game;

