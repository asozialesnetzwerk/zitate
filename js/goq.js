const preSelectedSelect = $(".pre-selected-select");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const tweetButton = $(".tweet");

const quoteSelectContainer = $(".quote-select-container");
const authorSelectContainer = $(".author-select-container");
const quoteSelect = $(".quote-select");
const authorSelect = $(".author-select");
const quoteText = $(".quote");
const authorText = $(".author");
const quoteInput = $(".quote-input");
const authorInput = $(".author-input");

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
        authorSelect.val("x").trigger("change");
        ids[1] = "x";
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
    tweetButton.attr("href", getBaseUrl() + getId());
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

const selectsHtml = {};
function resetQuoteOptions() {
    quoteSelect.html("");

    for (let q of Object.values(quotesJson)) {
        quoteSelect.append(new Option(q["quote"], q.id, false, false));
    }

    quoteSelect.append(new Option("Wähle ein Zitat :)", "x", true, true));

    selectsHtml["quote"] = quoteSelect.html();

    if (preSelected === quote) {
        quoteSelect.val(getRandomQuoteId().toString());
    }
    ids[0] = quoteSelect.val();

    quoteSelect.niceSelect('update');
}

function resetAuthorOptions() {
    authorSelect.html("");

    for (let a of Object.values(authorsJson)) {
        authorSelect.append(new Option(a["author"], a.id, false, false));
    }

    authorSelect.append(new Option("Wähle einen Autor :)", "x", true, true));

    selectsHtml["author"] = authorSelect.html();


    if (preSelected === author) {
        authorSelect.val(getRandomAuthorId().toString());
    }
    ids[1] = authorSelect.val();

    authorSelect.niceSelect('update');
}

function runCode() {
    resetQuoteOptions();
    resetAuthorOptions();
    updateSearchIndex();

    console.log(ids);

    quoteSelect.trigger("change");
    authorSelect.trigger("change");

    $(".select-container").css("opacity", "100");

    displayQuote();
    updateUrl();
}

$(document).ready(function() {
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

    const inputs = {"quote":quoteInput,"author":authorInput};
    const selects = {"quote":quoteSelect, "author":authorSelect}
    const oldValues = {"quote":"", "author":""};
    const intervals = {};

    function checkInput(type) {
        const newVal = inputs[type].val();
        if (oldValues[type] !== newVal) {
            let obj = {};
            const select = selects[type];

            select.html("");
            select.append(selectsHtml[type]);

            if (newVal.length > 0) {
                obj = findObject(type, newVal);
                console.log(obj);

                if (obj.id === -1) {
                    select.append(new Option(newVal, "-1", false, true));
                }
            } else {
                obj.id = "x";
            }

            select.html(select.html());
            select.niceSelect('update');
            setSelection(select, obj.id);
        }
        oldValues[type] = newVal;
    }

    addInputListener("quote");
    addInputListener("author");
    function addInputListener(type) {
        inputs[type]
            .bind('mouseout keyup', function () {
                checkInput(type);
            })
            .bind('focus', function () {
                intervals[type] = setInterval(() => checkInput(type), 200);
            })
            .bind('blur', function () {
                clearInterval(intervals[type]);
                checkInput(type);
            });
    }

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

loadFiles();

function findObject(type, str) {
    const isQuote = type === "quote";
    str = str.trim();
    const time = window.performance.now();
    const found = searchObject(type, str);
    const id = found.length === 0 ? -1 : found[0]["ref"];
    console.log(id);
    console.log(window.performance.now() - time);
    if (id === -1) {
        const obj = {id:-1};
        obj[type] = str;
        return obj;
    } else {
        return isQuote
            ? getQuoteById(id)
            : getAuthorById(id);
    }
}

const idx = {};
function updateSearchIndex() {
    idx["quote"] = lunr(function () {
        this.ref("id");
        this.field("quote");
        this.use(lunr.de);

        Object.values(quotesJson).forEach(function (doc) {
            this.add(doc);
        }, this);
    });

    idx["author"] = lunr(function () {
        this.ref("id");
        this.field("author");
        this.use(lunr.de);

        Object.values(authorsJson).forEach(function (doc) {
            this.add(doc);
        }, this);
    });
}

function searchObject(type, str) {
    return idx[type].search(str);
}