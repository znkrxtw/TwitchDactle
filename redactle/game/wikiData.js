class WikiData {

    constructor() {

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
                        const $el = $(el);
                        const replaced = $el.text().replace(/([\.,:()\[\]?!;`\~\-\u2013\—&*"])/g, '<span class="punctuation">$1</span>');
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
                        const txt = el.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                        if (!commonWords.includes(txt)) {
                            el.classList.toggle('baffled');
                            el.setAttribute('word-length', txt.length);
                            let b = baffle(el).once().set({characters: 'abcd'});
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
}