const preSelectedSelect = $(".select");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const tweetButton = $(".tweet");

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
    quoteSelect.append(new Option("Wähle ein Zitat :)", "x", true, true));
    if (preSelected === quote) {
        quoteSelect.val(getRandomQuote().toString());
    }

    let authors = "\n";
    for (let i = 0; i < authorsArr.length; i++) {
        if (authors.indexOf("\n" + authorsArr[i] + "\n") < 0) {
            authorSelect.append(new Option(authorsArr[i], i.toString(), false, false));
            authors += authorsArr[i] + "\n";
        }
    }
    authorSelect.append(new Option("Wähle einen Autor :)", "x", true, true));
    if (preSelected === author) {
        authorSelect.val(getRandomAuthor().toString());
    }

    quoteSelect.trigger("change");
    authorSelect.trigger("change");

    $(".select-container").css("opacity", "100");

    displayQuote();
    updateUrl();
}

$(document).ready(function() {
    $('.search-select').select2();

    preSelectedSelect.change(function () {
        quoteSelect.change(function() {
            ids[0] = quoteSelect.val();
            updateUrl();
        });

        authorSelect.change(function() {
            ids[1] = authorSelect.val();
            updateUrl();
        });

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