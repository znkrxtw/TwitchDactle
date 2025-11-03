class WikiData {

    constructor(game) {
        this.game = game;
        this.wikiHolder = game.wikiHolder;
        this.profileData = game.profileData;
        this.ui = game.ui;
        this.logic = game.logic;


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
                const cleanText = receivedJson.parse.text.replace(/<img[^>]*>/g, "").replace(/<small>/g, '').replace(/<\/small>/g, '').replace(/–/g, '-').replace(/<audio.*<\/audio>/g, "");
                this.ui.wikiHolder.style.display = "none";
                this.ui.wikiHolder.innerHTML = cleanText;
                const redirecting = document.getElementsByClassName('redirectMsg');
                if (redirecting.length > 0) {
                    const redirectURL = document.querySelectorAll('.redirectText')[0].firstChild.firstChild.innerHTML.replace(/ /g, "_");
                    this.conting = false;
                    this.fetchData(!this.conting, redirectURL);
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
                    const elements = document.getElementsByClassName('mw-parser-output');
                    if (seeAlso) {
                        const alsoIndex = Array.prototype.indexOf.call(seeAlso.parentNode.children, seeAlso);
                        for (let i = alsoIndex; i < elements[0].children.length; i++) {
                            elements[0].removeChild(elements[0].children[i]);
                        }
                    }
                    const all_bad_elements = this.ui.wikiHolder.querySelectorAll("[rel='mw-deduplicated-inline-style'], [title='Name at birth'], [aria-labelledby='micro-periodic-table-title'], .barbox, .wikitable, .clade, .Expand_section, .nowrap, .IPA, .thumb, .mw-empty-elt, .mw-editsection, .nounderlines, .nomobile, .searchaux, #toc, .sidebar, .sistersitebox, .noexcerpt, #External_links, #Further_reading, .hatnote, .haudio, .portalbox, .mw-references-wrap, .infobox, .unsolved, .navbox, .metadata, .refbegin, .reflist, .mw-stack, #Notes, #References, .reference, .quotebox, .collapsible, .uncollapsed, .mw-collapsible, .mw-made-collapsible, .mbox-small, .mbox, #coordinates, .succession-box, .noprint, .mwe-math-element, .cs1-ws-icon");

                    for (let i = 0; i < all_bad_elements.length; i++) {
                        all_bad_elements[i].remove();
                    }

                    const bElement = document.getElementsByTagName('b');
                    while (bElement.length) {
                        let parent = bElement[0].parentNode;
                        while (bElement[0].firstChild) {
                            parent.insertBefore(bElement[0].firstChild, bElement[0]);
                        }
                        parent.removeChild(bElement[0]);
                    }
                    const aElement = this.ui.wikiHolder.getElementsByTagName('a');
                    while (aElement.length) {
                        let parent = aElement[0].parentNode;
                        while (aElement[0].firstChild) {
                            parent.insertBefore(aElement[0].firstChild, aElement[0]);
                        }
                        parent.removeChild(aElement[0]);
                    }
                    const blockquote = document.getElementsByTagName('blockquote');
                    for (let i = 0; i < blockquote.length; i++) {
                        blockquote[i].innerHTML = blockquote[i].innerHTML.replace(/<[^>]*>?/gm, '');
                    }
                    const sup = document.getElementsByTagName('sup')
                    while (sup.length) {
                        sup[0].remove();
                    }
                    const excerpt = document.getElementsByClassName('excerpt');
                    while (excerpt.length) {
                        excerpt[0].remove();
                    }

                    elements[0].querySelectorAll('[title]').forEach(title => {
                        title.removeAttribute('title');
                    })

                    elements[0].querySelectorAll('.mw-headline').forEach(h => {
                        const parent = h.parentNode;
                        while (h.firstChild) parent.insertBefore(h.firstChild, h);
                        parent.removeChild(h);
                    });

                    let titleHolder = document.createElement("h1");
                    let titleTxt = article.replace(/_/g, ' ');
                    titleHolder.innerHTML = titleTxt;
                    elements[0].prepend(titleHolder);

                    this.ansStr = titleTxt.replace(/ *\([^)]*\) */g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    this.game.answer = this.ansStr.match(/\b(\w+'\w+|\w+)\b/g);
                    this.game.answer = this.game.answer.filter(function (el) {
                        return commonWords.indexOf(el) < 0;
                    });

                    elements[0].innerHTML = elements[0].innerHTML.replace(/\(; /g, '(').replace(/\(, /g, '(').replace(/\(, /g, '(').replace(/: ​;/g, ';').replace(/ \(\) /g, ' ').replace(/<\/?span[^>]*>/g, "");

                    elements[0].querySelectorAll('*').forEach(el => {
                        el.removeAttribute('class');
                        el.removeAttribute('style');
                    });

                    this.punctuation(elements);

                    elements[0].innerHTML = elements[0].innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/(<style.*<\/style>)/g, "").replace(/(<span class="punctuation">.<\/span>)|(^|<\/?[^>]+>|\s+)|([^\s<]+)/g, '$1$2<span class="innerTxt">$3</span>').replace('<<span class="innerTxt">h1>', '<h1><span class="innerTxt">');
                    elements[0].querySelectorAll('*:empty').forEach(el => el.remove());
                    this.ui.wikiHolder.innerHTML = this.ui.wikiHolder.innerHTML.replace(/<!--(?!>)[\S\s]*?-->/g, '');

                    // make the check for rejection here
                    // repackage the words into a text and send it to rejectArticle
                    const cleanerText = [...this.ui.wikiHolder.getElementsByClassName("innerTxt")].reduce((text, item) => text + ' ' + item.textContent, "");
                    if (rejectArticle(cleanerText)) {
                        // the article must be skipped
                        // wait 2 seconds and start a new game
                        console.log("Skipping the article " + this.game.profileData.articleName);
                        setTimeout(() => this.game.profileData.newGame(), 2000);
                        return;
                    }

                    this.game.gameIsActive = true;
                    this.extracted();

                    if (this.profileData.guessedWords.length > 0) {
                        for (var i = 0; i < this.profileData.guessedWords.length; i++) {
                            this.game.guessCounter += 1;
                            this.logic.performGuess(this.profileData.guessedWords[i][0], true);
                        }
                    }
                    if (this.profileData.numbersRevealed) {
                        this.ui.revealNumbers();
                    }

                    if (window.pluralizing) {
                        document.getElementById("autoPlural").checked = true;
                    } else {
                        document.getElementById("autoPlural").checked = false;
                    }

                    if (this.profileData.hidingZero) {
                        document.getElementById("hideZero").checked = true;
                        this.ui.hideZero();
                    } else {
                        document.getElementById("hideZero").checked = false;
                        this.ui.showZero();
                    }

                    if (this.profileData.selectedArticles === 'custom') {
                        document.getElementById("selectArticle").value = 'custom';
                        this.logic.selectArticlesCustom();
                    } else {
                        document.getElementById("selectArticle").value = 'standard';
                        this.logic.selectArticlesStandard();
                    }

                    document.getElementById("streamName").value = this.profileData.streamName;

                    if (this.ui.pageRevealed) {
                        this.ui.winRound(true);
                        this.profileData.saveProgress();
                    }

                    this.ui.wikiHolder.style.display = "flex";
                }
            })
            .catch(err => {
                console.error("Error in while getting article: ", err);
            });
    }


    extracted() {
        const root = this.ui.wikiHolder.querySelector('.mw-parser-output') || this.ui.wikiHolder;
        if (!root) return;

        // ensure storage arrays exist
        this.game.baffled = this.game.baffled || [];
        this.game.baffledNumbers = this.game.baffledNumbers || [];

        // select all spans that are not already punctuation
        const nodes = root.querySelectorAll('span:not(.punctuation)');
        nodes.forEach(el => {
            // skip elements already revealed (data-word set) or empty nodes
            if (el.hasAttribute('data-word')) return;
            const raw = el.textContent;
            if (!raw || !raw.trim()) return;

            const txt = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
            if (commonWords.includes(txt)) return;

            // mark as baffled and record length (same behavior as original)
            el.classList.add('baffled');
            el.setAttribute('word-length', txt.length);

            // create baffle instance and store it
            const b = window.baffle(el).once().set({ characters: 'abcd' });
            this.game.baffled.push([txt, b]);

            // track numeric tokens separately (preserves original logic)
            if (!isNaN(txt)) {
                this.game.baffledNumbers.push(b);
            }
        });

        // $(".mw-parser-output span").not(".punctuation").each((i, el) => {
        //     const txt = el.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        //     if (!commonWords.includes(txt)) {
        //         el.classList.toggle('baffled');
        //         el.setAttribute('word-length', txt.length);
        //         let b = baffle(el).once().set({characters: 'abcd'});
        //         this.game.baffled.push([txt, b]);
        //         if (!isNaN(txt)) {
        //             this.game.baffledNumbers.push(b);
        //         }
        //     }
        // });
    }

    punctuation(elements) {

        const root = elements[0];
        if (!root) return;

        // punctuation characters to wrap
        const rx = /([.,:()\[\]?!;`~\-\u2013—&*"])/g;
        const selectors = "p, blockquote, h1, h2, table, li, i, cite, span";

        // For each container, replace text node content with a fragment that has punctuation wrapped
        root.querySelectorAll(selectors).forEach(container => {
            // snapshot child nodes because we'll modify them
            Array.from(container.childNodes).forEach(node => {
                if (node.nodeType !== Node.TEXT_NODE) return;
                const text = node.nodeValue;
                if (!text || !text.trim()) return;

                const replaced = text.replace(rx, '<span class="punctuation">$1</span>');
                // only replace when something changed
                if (replaced === text) return;

                const frag = document.createRange().createContextualFragment(replaced);
                node.parentNode.replaceChild(frag, node);
            });
        });
    }
}