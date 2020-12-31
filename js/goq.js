const preSelectedSelect = $(".select");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const openButton = $(".tweet");

const quoteSelectContainer = $(".quote-select-container");
const authorSelectContainer = $(".author-select-container");
const quoteSelect = $(".quote-select");
const authorSelect = $(".author-select");
const quoteText = $(".quote");
const authorText = $(".author");

const none = "n";
const quote = "z";
const author = "a";

const ids = ["x", "x"];
let preSelected = none;

const app = $.sammy(function() {
    this.get("/#/:id", function() {
        preSelected = getParamFromURL("pre", author).toLowerCase();
        setSelection(preSelectedSelect, preSelected);

        const idsParam = this.params["id"].split("-");

        ids[0] = idsParam[0] === "" || idsParam[0] === null || idsParam[0] === "null" ? "x" : idsParam[0];
        ids[1] = idsParam[1] === "" || idsParam[1] === null || idsParam[1] === "null" ? "x" : idsParam[1];

        if (preSelected === quote && ids[0] === "x") {
            ids[0] = getRandomQuoteId().toString();
        } else if (preSelected === author && ids[1] === "x") {
            ids[1] = getRandomQuoteId().toString();
        }

        if (quoteSelect.val() !== ids[0]) {
            quoteSelect.val(ids[0]).trigger("change");
        }

        if (authorSelect.val() !== ids[1]) {
            authorSelect.val(ids[1]).trigger("change");
        }

        displayQuote();
    });
});
app.run();

function getId() {
    return ids[0] + "-" + ids[1];
}

function displayQuote() {
    if (!hasLoaded()) return;
    if (isNullOrUndefined(quoteSelect.val())) {
        quoteSelect.val("x").trigger("change");
        ids[0] = "x";
    }
    if (isNullOrUndefined(authorSelect.val())) {
        console.log("undefined: " + ids[1]);
        const name = getAuthorById(ids[1])["author"];
        console.log("name = " + name);
        if (isNullOrUndefined(name)) {
            authorSelect.val("x").trigger("change");
        }
        //cuz names only get added to the list once:
        const authors = Object.values(authorsJson);
        for (let i = 0; i < authors.length; i++) {
            if (name === authors[i]["author"]) {
                authorSelect.val(i.toString()).trigger("change");
                ids[1] = i.toString();
                break;
            }
        }
        console.log(ids);
    }

    quoteId.text(getId());

    const quoteIsSelected = preSelected === quote;
    changeVisibility(quoteSelectContainer, !quoteIsSelected);
    changeVisibility(quoteText, quoteIsSelected);
    quoteText.text(quoteIsSelected ? getQuoteById(ids[0])["quote"] : "");

    const authorIsSelected = preSelected === author;
    changeVisibility(authorSelectContainer, !authorIsSelected);
    changeVisibility(authorText, authorIsSelected);
    authorText.text(authorIsSelected ? "- " + getAuthorById(ids[1])["author"] : "");

    nextQuote.attr("href", getRandomUrl());
    openButton.attr("href", getBaseUrl() + getId());
}

function getRandomUrl() {
    let url = getBaseUrl() + "goq/#/";
    if (preSelected === quote) {
        url += getRandomQuoteId() + "-x";
    } else if (preSelected === author) {
        url += "x-" + getRandomAuthorId();
    } else {
        url += "x-x";
    }
    return url + "?pre=" + preSelected;
}

function updateUrl() {
    openPrivateUrl(getBaseUrl() + "goq/#/" + getId() + "?pre=" + preSelected);
    quoteId.text(getId());
}

function runCode() {
    for (let q of Object.values(quotesJson)) {
        quoteSelect.append(new Option(q["quote"], q.id, false, false));
    }
    quoteSelect.append(new Option("Wähle ein Zitat :)", "x", true, true));
    if (preSelected === quote) {
        quoteSelect.val(getRandomQuoteId().toString());
    }
    ids[0] = quoteSelect.val();

    let authors = [];
    for (let a of Object.values(authorsJson)) {
        if (!authors.includes(a["author"])) {
            authorSelect.append(new Option(a["author"], a.id, false, false));
            authors.push(a["author"]);
        }
    }
    authorSelect.append(new Option("Wähle einen Autor :)", "x", true, true));
    if (preSelected === author) {
        authorSelect.val(getRandomAuthorId().toString());
    }
    ids[1] = authorSelect.val();

    console.log(ids);

    quoteSelect.trigger("change");
    authorSelect.trigger("change");

    $(".select-container").css("opacity", "100");

    displayQuote();
    updateUrl();
}

$(document).ready(function() {
    $('.search-select').select2();

    quoteSelect.change(function() {
        if (!isNullOrUndefined(quoteSelect.val())) {
            ids[0] = quoteSelect.val();
            updateUrl();
        }
    });

    authorSelect.change(function() {
        if (!isNullOrUndefined(authorSelect.val())) {
            ids[1] = authorSelect.val();
            updateUrl();
        }
    });

    preSelectedSelect.change(function () {
        if (preSelectedSelect.val() !== preSelected) {
            preSelected = preSelectedSelect.val();

            if (preSelected === quote) {
                if (quoteSelect.val() === "x") {
                    quoteSelect.val(getRandomQuoteId()).trigger("change");
                }
            } /*else {
                ids[0] = "x";
            } */

            if (preSelected === author) {
                if (authorSelect.val() === "x") {
                    authorSelect.val(getRandomAuthorId()).trigger("change");
                }
            } /*else {
                ids[1] = "x";
            }*/

            displayQuote();
            updateUrl();
        }
    });
});

let searchResultArr;
let index;
function testSearch(quote, callback) {
    let time = window.performance.now();
    getQuotes(quote, (quotesArr) => {
        searchResultArr = quotesArr;
        const toSearchObjArr = strArrToObjArr(quotesArr);
        for (const qObj of toSearchObjArr) {
            if (qObj.text === quote) {
                if (typeof callback === "function") {
                    callback([quotesArr[qObj.id]]);
                } else {
                    console.log([quotesArr[qObj.id]]);
                }
                return;
            }
        }
        index = lunr(function () {
            this.ref("id");
            this.field("text");

            toSearchObjArr.forEach(q => {
                this.add(q);
            }, this);
        });

        let resultArr = lunrResultToArr(quotesArr, index.search(quote));

        if (resultArr.length < 1) {
            console.log("not found without stemming");
            index = lunr(function () {
                this.ref("id");
                this.field("text");
                this.use(lunr.multiLanguage("en", "de"));

                toSearchObjArr.forEach(q => {
                    this.add(q);
                }, this);
            });
            resultArr = lunrResultToArr(quotesArr, index.search(quote));
        }

        if (typeof callback === "function") {
            callback(resultArr);
        } else {
            console.log(resultArr);
        }
        console.log((window.performance.now() - time) + "ms");
    });
}

function lunrResultToArr(searched, lunrResult) {
    const resultArr = [];
    for (let i = 0; i < lunrResult.length && resultArr.length < 10; i++) {
        const el = searched[lunrResult[i].ref];
        if (!resultArr.includes(el)) resultArr.push(el);
    }
    return resultArr;
}

function strArrToObjArr(arr) {
    const objArr = [];
    console.log(arr.length);
    for (let i = 0; i < arr.length; i++) {
        objArr.push({text: arr[i].split("\" - ")[0].substring(1), id:i});
    }
    console.log(objArr);
    return objArr;
}

function getQuotes(search, callback) {
    WikiquoteApi.openSearch(search, (titleArr) => {
        if (titleArr.length > 0) {
            const qArr = [];
            const promises = [];
            for (let i = 0; i < titleArr.length && i < 4; i++) {
                promises.push(new Promise(resolve => {
                    WikiquoteApi.queryTitles(titleArr[i].title, (pageId) => {
                        WikiquoteApi.getSectionsForPage(pageId, (sectionObj) => {
                            for (const section of sectionObj.sections) {
                                promises.push(new Promise(resolve2 => {
                                    WikiquoteApi.getQuotesForSection(pageId, section, (qObj) => {
                                        qObj.quotes.forEach(q => {
                                            qArr.push(q + " - " + titleArr[i].title);
                                            resolve();
                                            resolve2();
                                        });
                                    }, (e) => {
                                        console.error(e);
                                        resolve();
                                        resolve2();
                                    });
                                }));
                            }
                        }, (e) => {
                            console.error(e);
                            resolve();
                        });
                    }, (e) => {
                        console.error(e);
                        resolve();
                    });
                }));
            }
            Promise.all(promises).then(() => {
                console.log(promises.length);
                callback(qArr);
            });
        } else {
            console.log(`Nothing found for query "${search}".`);
        }
    }, (e) => {
        console.error(e);
    });
}
loadFiles();