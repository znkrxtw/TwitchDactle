var wikiHolder = document.getElementById("wikiHolder")
var guessLogBody = document.getElementById("guessLogBody");
var statLogBody = document.getElementById("statsTable");
var baffled = [];
var guessedWords = [];
var answer = [];
var ansStr;
var guessCounter = 0;
var hidingZero = false;
var hidingLog = false;
var selectedArticles = 'standard';
var streamName = "";
var currentlyHighlighted;
var gameWins = [];
var gameScores = [];
var gameAccuracy = [];
var gameAnswers = [];
var hitCounter = 0;
var currentAccuracy = -1;
var save = {};
var pageRevealed = false;
var clickThruIndex = 0;
var clickThruNodes = [];
var redirectable;
var conting;
var playerID;
var ses;
var redactleIndex;
var yesterday;
var articleName;
var loadingIcon;

var gameIsActive = false;

function uuidv4() {
    return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function median(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

const average = (array) => array.reduce((a, b) => a + b) / array.length;

function LoadSave() {
    if (localStorage.getItem("redactleSavet") === null) {
        localStorage.clear();
        playerID = uuidv4();
        articleName = getArticleName();
        redactleIndex = 0;
        save = JSON.parse(JSON.stringify({ "saveData": { redactleIndex, articleName, guessedWords, gameWins, gameScores, gameAccuracy, gameAnswers }, "prefs": { hidingZero, hidingLog, pluralizing, selectedArticles, streamName }, "id": { playerID } }));
    } else {
        save = JSON.parse(localStorage.getItem("redactleSavet"));
    }
    localStorage.setItem("redactleSavet", JSON.stringify(save));

    playerID = save.id.playerID;
    articleName = save.saveData.articleName;
    hidingZero = save.prefs.hidingZero;
    hidingLog = save.prefs.hidingLog;
    selectedArticles = save.prefs.selectedArticles;
    pluralizing = save.prefs.pluralizing;
    streamName = save.prefs.streamName;
    redactleIndex = save.saveData.redactleIndex;
    gameWins = save.saveData.gameWins;
    gameScores = save.saveData.gameScores;
    gameAccuracy = save.saveData.gameAccuracy;
    gameAnswers = save.saveData.gameAnswers;
    var gameDelta = redactleIndex - save.saveData.gameWins.length;
    for (var i = 0; i < gameDelta; i++) {
        gameWins.push(0);
        gameScores.push(0);
        gameAccuracy.push(0);
        gameAnswers.push('');
    }

    guessedWords = save.saveData.guessedWords;

    SaveProgress();

    fetchData(true, articleName);
}

async function fetchData(retry, artStr) {

    if (retry) {
        var article = artStr;
    } else {
        var article = atob(artStr);
    }
    return await fetch('https://en.wikipedia.org/w/api.php?action=parse&format=json&page=' + article + '&prop=text&formatversion=2&origin=*')
        .then(resp => {
            if (!resp.ok) {
                throw `Server error: [${resp.status}] [${resp.statusText}] [${resp.url}]`;
            }
            return resp.json();
        })
        .then(receivedJson => {
            let LIcon = new ldloader({ root: "#loadingIcon" })
            conting = true;
            var cleanText = receivedJson.parse.text.replace(/<img[^>]*>/g, "").replace(/\<small\>/g, '').replace(/\<\/small\>/g, '').replace(/–/g, '-').replace(/<audio.*<\/audio>/g, "");
            wikiHolder.style.display = "none";
            wikiHolder.innerHTML = cleanText;
            var redirecting = document.getElementsByClassName('redirectMsg');
            if (redirecting.length > 0) {
                var redirURL = $('.redirectText')[0].firstChild.firstChild.innerHTML.replace(/ /g, "_");
                conting = false;
                fetchData(!conting, redirURL)
            }
            if (conting) {
                LIcon.on();

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
                    alsoIndex = Array.prototype.indexOf.call(seeAlso.parentNode.children, seeAlso);
                    for (var i = alsoIndex; i < e[0].children.length; i++) {
                        e[0].removeChild(e[0].children[i]);
                    }
                }
                var all_bad_elements = wikiHolder.querySelectorAll("[rel='mw-deduplicated-inline-style'], [title='Name at birth'], [aria-labelledby='micro-periodic-table-title'], .barbox, .wikitable, .clade, .Expand_section, .nowrap, .IPA, .thumb, .mw-empty-elt, .mw-editsection, .nounderlines, .nomobile, .searchaux, #toc, .sidebar, .sistersitebox, .noexcerpt, #External_links, #Further_reading, .hatnote, .haudio, .portalbox, .mw-references-wrap, .infobox, .unsolved, .navbox, .metadata, .refbegin, .reflist, .mw-stack, #Notes, #References, .reference, .quotebox, .collapsible, .uncollapsed, .mw-collapsible, .mw-made-collapsible, .mbox-small, .mbox, #coordinates, .succession-box, .noprint, .mwe-math-element, .cs1-ws-icon");

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
                var a = wikiHolder.getElementsByTagName('a');
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
                ansStr = titleTxt.replace(/ *\([^)]*\) */g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                answer = ansStr.match(/\b(\w+'\w+|\w+)\b/g);
                answer = answer.filter(function (el) {
                    return commonWords.indexOf(el) < 0;
                });
                e[0].innerHTML = e[0].innerHTML.replace(/\(; /g, '(').replace(/\(, /g, '(').replace(/\(, /g, '(').replace(/: ​;/g, ';').replace(/ \(\) /g, ' ').replace(/<\/?span[^>]*>/g, "");;
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
                wikiHolder.innerHTML = wikiHolder.innerHTML.replace(/<!--(?!>)[\S\s]*?-->/g, '');

                // make the check for rejection here
                // repackage the words into a text and send it to rejectArticle
                // (i'm too lazy to do it properly, !thisisfine)
                var cleanerText = [...wikiHolder.getElementsByClassName("innerTxt")].reduce((text, item) => text + ' ' + item.textContent, "");
                if (rejectArticle(cleanerText)) {
                    // the article must be skipped
                    // wait 2 seconds and start a new game
                    console.log("Skipping the article " + articleName);
                    setTimeout(newGame, 2000);
                    return;
                }

                gameIsActive = true;

                $(".mw-parser-output span").not(".punctuation").each(function () {
                    var txt = this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    if (!commonWords.includes(txt)) {
                        this.classList.toggle('baffled');
                        let b = baffle(this).once().set({
                            characters: 'abcd'
                        });
                        baffled.push([txt, b]);
                    }
                });

                if (guessedWords.length > 0) {
                    for (var i = 0; i < guessedWords.length; i++) {
                        guessCounter += 1;
                        PerformGuess(guessedWords[i][0], true);
                    }
                }

                if (pluralizing) {
                    document.getElementById("autoPlural").checked = true;
                } else {
                    document.getElementById("autoPlural").checked = false;
                }

                if (hidingZero) {
                    document.getElementById("hideZero").checked = true;
                    HideZero();
                } else {
                    document.getElementById("hideZero").checked = false;
                    ShowZero();
                }

                if (selectedArticles === 'custom') {
                    document.getElementById("selectArticle").value = 'custom';
                    SelectArticlesCustom();
                } else {
                    document.getElementById("selectArticle").value = 'standard';
                    SelectArticlesStandard();
                }

                document.getElementById("streamName").value = streamName;

                // TODO maybe fix later
                //if(redactleIndex > 0){
                //    document.getElementById("yesterday").innerHTML = `The answer to yesterday's Redactle was: ${atob(yesterday).replace(/ *\([^)]*\) */g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/_/g," ").toLowerCase()}`;
                //}


                wikiHolder.style.display = "flex";
                LIcon.off();
            }
        })
        .catch(err => {
            console.error("Error in fetch", err);
            alert("Something went wrong while loading the page. Try refreshing.");
            LIcon.off();
        });
}
LoadSave();


function PerformGuess(guessedWord, populate) {
    if (!gameIsActive) {
        return;
    }
    clickThruIndex = 0;
    RemoveHighlights(false);
    var normGuess = guessedWord.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (commonWords.includes(normGuess)) {

    }
    else {
        var alreadyGuessed = false;
        for (var i = 0; i < guessedWords.length; i++) {
            if (guessedWords[i][0] == normGuess) {
                var alreadyGuessed = true;
            }
        }
        if (!alreadyGuessed || populate) {
            var numHits = 0;
            for (var i = 0; i < baffled.length; i++) {
                if (baffled[i][0] == normGuess) {
                    baffled[i][1].reveal();
                    baffled[i][1].elements[0].element.classList.remove("baffled");
                    baffled[i][1].elements[0].element.setAttribute("data-word", normGuess);
                    numHits += 1;
                    if (!populate) {
                        baffled[i][1].elements[0].element.classList.add("highlighted");
                        currentlyHighlighted = normGuess;
                    }
                }
            }
            save.saveData.guessedWords = guessedWords;
            if (!populate) {
                guessCounter += 1;
                guessedWords.push([normGuess, numHits, guessCounter]);
                SaveProgress();
            }
            LogGuess([normGuess, numHits, guessCounter], populate);
        } else {
            $("tr[data-guess='" + normGuess + "']").addClass("table-secondary");
            $("tr[data-guess='" + normGuess + "']")[0].scrollIntoView();
            currentlyHighlighted = normGuess;
            $('.innerTxt').each(function () {
                if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == normGuess) {
                    this.classList.add('highlighted');
                }
            });
        }
        if (answer.includes(normGuess)) {
            answer = answer.filter(function (e) { return e !== normGuess })
        }
        if (answer.length == 0) {
            WinRound(populate);
        }
    }
    //document.getElementById("userGuess").value = ''; // removed due to PerformGuess being called through twitch input concurrently
}

function LogGuess(guess, populate) {
    if (hidingZero) {
        HideZero();
    }
    var newRow = guessLogBody.insertRow(0);
    newRow.class = 'curGuess';
    newRow.setAttribute('data-guess', guess[0]);
    if (!populate) {
        newRow.classList.add('table-secondary');
    }
    if (guess[1] > 0) {
        hitCounter += 1;
    }
    if (!pageRevealed) {
        currentAccuracy = ((hitCounter / guessedWords.length) * 100).toFixed(2);
    }
    if (guess[1] > 0) {
        $(newRow).on('click', function (e) {
            e.preventDefault();
            var inTxt = this.getElementsByTagName('td')[1].innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
            allInstances = wikiHolder.querySelectorAll('[data-word="' + inTxt + '"]');
            if (currentlyHighlighted == null) {
                clickThruIndex = 0;
                currentlyHighlighted = inTxt;
                this.classList.add('table-secondary');
                $('.innerTxt').each(function () {
                    if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == currentlyHighlighted) {
                        $(this).addClass('highlighted');
                    }
                });
            } else {
                if (inTxt == currentlyHighlighted) {

                } else {
                    clickThruIndex = 0;
                    RemoveHighlights(false);
                    this.classList.add('table-secondary');
                    $('.innerTxt').each(function () {
                        if (this.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == inTxt) {
                            this.classList.add('highlighted');
                        }
                    })
                    currentlyHighlighted = inTxt;
                }
            }
            $('.superHighlighted').each(function () {
                this.classList.remove('superHighlighted');
            });
            allInstances[clickThruIndex % allInstances.length].classList.add('superHighlighted');
            allInstances[clickThruIndex % allInstances.length].scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'end'
            });
            clickThruIndex += 1;
        });
    } else {
        $(newRow).on('click', function (e) {
            RemoveHighlights(true);
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


function WinRound(populate) {
    gameIsActive = false;
    document.getElementById("userGuess").disabled = true;
    if (!pageRevealed) {
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
        RevealPage();
        if (!populate) {
            gameScores[redactleIndex] = guessedWords.length;
            gameAccuracy[redactleIndex] = currentAccuracy;
            gameAnswers[redactleIndex] = ansStr;
            gameWins[redactleIndex] = 1;
        }
    }
    var streakCount = 0;
    for (var i = gameWins.length; i > -1; i--) {
        if (gameWins[i] == 1) {
            streakCount += 1;
        }
        if (gameWins[i] == 0) {
            break;
        }
    }
    var vicData;
    /*
    $.ajax({
        type: "POST",
        url: "/vic.php",
        dataType:'text',
        data:{
            'playerID': String(playerID),
            'currentRedactle': redactleIndex,
            'score': guessedWords.length,
            'accuracy': parseInt(currentAccuracy*100),
            'token': token
        },
        success: function(data){
            vicData = JSON.parse(data);
        },
        error: function(){token
            document.getElementById("winText").innerHTML = `<h3>Congratulations, you solved Redactle #${redactleIndex+1}!</h3><ul><li>The answer was: ${ansStr}</li><li>You solved it in ${gameScores[redactleIndex]} guesses</li><li>Your accuracy was ${currentAccuracy}%</li><li>You have solved ${streakCount} consecutive Redactles</li></ul><p><a href="javascript:ShareResults();">Share your results</a></p>`;
            document.getElementById("winText").style.display = 'block';
        }
    }).then( function(){
        var globalStr;
        switch(vicData.length){
            case 1:
                globalStr = "You are the only player to solve today's Redactle"
            default:
                globalStr = `Globally, ${vicData.length} players have solved today's Redactle`
        }
        var scores=[];
        var accs=[];
        for(var sc in vicData){
            scores.push(vicData[sc].score);
            accs.push(vicData[sc].accuracy);
        }
    token
        document.getElementById("winText").innerHTML = `<h3>Congratulations, you solved Redactle #${redactleIndex+1}!</h3><ul><li>The answer was: ${ansStr}</li><li>You solved it in ${gameScores[redactleIndex]} guesses</li><li>Your accuracy was ${currentAccuracy}%</li><li>You have solved ${streakCount} consecutive Redactles</li></ul><h3>Global Stats</h3><ul><li>${globalStr} so far</li><li>Global Median: ${median(scores).toFixed(2)} Guesses; ${(median(accs)/100).toFixed(2)}% Accuracy</li><li>Global Average: ${average(scores).toFixed(2)} Guesses; ${(average(accs)/100).toFixed(2)}% Accuracy</li></ul><p><a href="javascript:ShareResults();">Share your results</a></p>`;
        document.getElementById("winText").style.display = 'block';
    });
    */

    SaveProgress();
}

function ShareResults() {
    const shareText = "I solved today's Redactle (#" + (redactleIndex + 1) + ") in " + gameScores[redactleIndex] + " guesses with an accuracy of " + currentAccuracy + "%. Played at https://www.redactle.com/";
    const copied = ClipboardJS.copy(shareText);
    if (copied) {
        alert("Results copied to clipboard. Thanks for playing!");
    }
    else {
        alert("Something went wrong trying to copy results to clipboard.");
    }
}

function RevealPage() {
    RemoveHighlights(false);
    for (var i = 0; i < baffled.length; i++) {
        baffled[i][1].reveal();
        baffled[i][1].elements[0].element.classList.remove("baffled");
    }
    pageRevealed = true;

    PrepareForNextGame();
}

async function PrepareForNextGame() {
    var i = 0;
    var elem = document.getElementById("NextGameBar");
    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
        if (width >= 100) {
            clearInterval(id);
            i = 0;
        } else {
            width++;
            elem.style.width = width + "%";
        }
    }
}

function BuildStats() {
    for (var i = statLogBody.rows.length - 1; i > 0; i--) {
        statLogBody.deleteRow(i);
    }
    for (var i = 0; i < gameWins.length; i++) {
        if (gameWins[i] == 1) {
            var statRow = statLogBody.insertRow(1);
            statRow.innerHTML = '<td>' + (i + 1) + '</td><td>' + gameAnswers[i] + '</td><td>' + gameScores[i] + '</td><td>' + gameAccuracy[i] + '%</td>';
        }
    }
}

function HideZero() {
    hidingZero = true;
    SaveProgress();
    $('.tableHits').each(function () {
        if (this.innerHTML == '0') {
            $(this).parent().addClass('hiddenRow');
        }
    });
}

function ShowZero() {
    hidingZero = false;
    SaveProgress();
    $('.hiddenRow').each(function () {
        $(this).removeClass('hiddenRow');
    });
}

function SelectArticlesStandard() {
    selectArticle = 'standard';
    SaveProgress();
}

function SelectArticlesCustom() {
    selectArticle = 'custom';
    SaveProgress();
}

function RemoveHighlights(clearCur) {
    if (clearCur) {
        currentlyHighlighted = null;
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

function SaveProgress() {
    //if($('#autoPlural').is(':checked')){
    //    pluralizing = true;
    //} else{
    //    pluralizing = false;
    //}
    save.saveData.redactleIndex = redactleIndex;
    save.saveData.articleName = articleName;
    save.saveData.guessedWords = guessedWords;
    save.saveData.gameWins = gameWins;
    save.saveData.gameScores = gameScores;
    save.saveData.gameAccuracy = gameAccuracy;
    save.prefs.hidingZero = hidingZero;
    save.prefs.selectedArticles = selectedArticles;
    save.prefs.hidingLog = hidingLog;
    save.prefs.streamName = streamName;
    save.prefs.pluralizing = pluralizing;
    localStorage.setItem("redactleSavet", JSON.stringify(save));
}

function newGame() {
    localStorage.clear();
    save.saveData.redactleIndex += 1;
    save.saveData.articleName = getArticleName();
    save.saveData.guessedWords = [];
    save.saveData.gameWins = gameWins;
    save.saveData.gameScores = gameScores;
    save.saveData.gameAccuracy = gameAccuracy;
    save.prefs.hidingZero = hidingZero;
    save.prefs.selectedArticles = selectedArticles;
    save.prefs.hidingLog = hidingLog;
    save.prefs.streamName = streamName;
    save.prefs.pluralizing = pluralizing;
    baffled = [];
    answer = [];
    guessCounter = 0;
    hitCounter = 0;
    currentAccuracy = -1;
    pageRevealed = false;
    clickThruIndex = 0;
    clickThruNodes = []; // doesn't seem to be used
    localStorage.setItem("redactleSavet", JSON.stringify(save));
    $("#guessLogBody").empty();
    document.getElementById("userGuess").disabled = false;
    LoadSave();
    //location.reload();
}

function getArticleName() {
    var e = document.getElementById("selectArticle");
    var value = e.value;
    if (value === 'custom') {
        return customArticles[Math.floor(Math.random() * customArticles.length)];
    }
    return articles[Math.floor(Math.random() * articles.length)];

}

