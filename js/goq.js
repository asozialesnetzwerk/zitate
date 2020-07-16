const preSelectedSelect = $(".select");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const tweetButton = $(".tweet");

console.log(nextQuote);

const quoteSelect = $(".quote-select");
const authorSelect = $(".author-select");
const quoteSelectContainer = $(".quote-select-container");
const authorSelectContainer = $(".author-select-container");
const quoteText = $(".quote");
const authorText = $(".author");

const none = "n";
const quote = "z";
const author = "a";

const ids = ["0", "0"];
let preSelected = none;

const app = $.sammy(function() {
    this.get("/#/:id", function() {
        preSelected = getParamFromURL("pre", author).toLowerCase();
        setSelection(preSelectedSelect, preSelected);

        const idsParam = this.params["id"].split("-");

        ids[0] = idsParam[0] === "" || idsParam[0] === null || idsParam[0] === "null" ? "x" : idsParam[0];
        ids[1] = idsParam[1] === "" || idsParam[1] === null || idsParam[1] === "null" ? "x" : idsParam[1];

        if (preSelected === quote && ids[0] === "x") {
            ids[0] = getRandomQuote().toString();
        } else if (preSelected === author && ids[1] === "x") {
            ids[1] = getRandomQuote().toString();
        }

        if (quoteSelect.val() !== ids[0]) {
            quoteSelect.val(ids[0] === "x" ? quotesArr.length : ids[0]).trigger("change");
        }

        if (authorSelect.val() !== ids[1]) {
            authorSelect.val(ids[1] === "x" ? authorsArr.length : ids[1]).trigger("change");
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
    quoteId.text(getId());

    const quoteIsSelected = preSelected === quote;
    changeVisibility(quoteSelectContainer, !quoteIsSelected);
    changeVisibility(quoteText, quoteIsSelected);
    quoteText.text(quoteIsSelected ? quotesArr[ids[0]] : "");

    const authorIsSelected = preSelected === author;
    changeVisibility(authorSelectContainer, !authorIsSelected);
    changeVisibility(authorText, authorIsSelected);
    authorText.text(authorIsSelected ? "- " + authorsArr[ids[1]] : "");

    nextQuote.attr("href", getRandomUrl());
    tweetButton.attr("href", getBaseUrl() + getId());
}

function getRandomUrl() {
    let url = getBaseUrl() + "goq/#/";
    if (preSelected === quote) {
        url += getRandomQuote() + "-x";
    } else if (preSelected === author) {
        url += "x-" + getRandomAuthor();
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
    for (let i = 0; i < quotesArr.length; i++) {
        quoteSelect.append(new Option(quotesArr[i], i.toString(), false, false));
    }

    quoteSelect.append(new Option("Wähle ein Zitat :)", quotesArr.length, true, true));
    if (preSelected === none || preSelected !== quote) {
        ids[0] = "x";
    } else {
        ids[0] = getRandomQuote().toString();
        quoteSelect.val(ids[0]);
    }

    for (let i = 0; i < authorsArr.length; i++) {
        authorSelect.append(new Option(authorsArr[i], i.toString(), false, false));
    }

    authorSelect.append(new Option("Wähle einen Autor :)", authorsArr.length, true, true));
    if (preSelected === none || preSelected !== author) {
        ids[1] = "x";
    } else {
        ids[1] = getRandomAuthor().toString();
        authorSelect.val(ids[1]);
    }

    quoteSelect.trigger("change");
    authorSelect.trigger("change");

    quoteSelect.change(function() {
        ids[0] = quoteSelect.val() === quotesArr.length.toString() ? "x" : quoteSelect.val();
        updateUrl();
    });

    authorSelect.change(function() {
        ids[1] = authorSelect.val() === authorsArr.length.toString() ? "x" : authorSelect.val();
        updateUrl();
    });

    displayQuote();
    updateUrl();
}

$(document).ready(function() {
    $('.search-select').select2();

    preSelectedSelect.change(function () {
        if (preSelectedSelect.val() !== preSelected) {
            preSelected = preSelectedSelect.val();

            if (preSelected !== quote) {
                ids[0] = quotesArr.length;
            }
            if (preSelected !== author) {
                ids[1] = authorsArr.length;
            }

            displayQuote();
            updateUrl();
        }
    });
});

loadFiles();