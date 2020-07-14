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

        ids[0] = idsParam[0] === "" || idsParam[0] === null ? "x" : idsParam[0];
        ids[1] = idsParam[1] === "" || idsParam[1] === null ? "x" : idsParam[1];

        if(preSelected === quote && ids[0] === "x") {
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

    if(preSelected === quote) {
        changeVisibility(quoteSelectContainer, false);
        changeVisibility(quoteText, true);
        quoteText.text(quotesArr[ids[0]]);
    } else {
        changeVisibility(quoteSelectContainer, true);
        changeVisibility(quoteText, false);
        quoteText.text("");
    }

    if(preSelected === author) {
        changeVisibility(authorSelectContainer, false);
        changeVisibility(authorText, true);
        authorText.text(authorsArr[ids[1]]);
    } else {
        changeVisibility(authorSelectContainer, true);
        changeVisibility(authorText, false);
        authorText.text("");
    }

    nextQuote.attr("href", getBaseUrl() + "goq/#/x-x?pre=" + preSelected);
    tweetButton.attr("href", getBaseUrl() + "#/" + getId());
}

function updateUrl() {
    openPrivateUrl(getBaseUrl() + "goq/#/" + getId() + "?pre=" + preSelected);
    quoteId.text(getId());
}

function runCode() {
    for (let i = 0; i < quotesArr.length; i++) {
        quoteSelect.append(new Option(quotesArr[i], i.toString(), false, false));
    }

    const chooseQuote = preSelected === none || preSelected !== quote;
    quoteSelect.append(new Option("Wähle ein Zitat :)", quotesArr.length, chooseQuote, chooseQuote));
    ids[0] = chooseQuote ? "x" : getRandomQuote();

    if(!chooseQuote) {
        quoteSelect.val(ids[0]);
    }

    for (let i = 0; i < authorsArr.length; i++) {
        authorSelect.append(new Option(authorsArr[i], i.toString(), false, false));
    }

    const chooseAuthor = preSelected === none || preSelected !== author;
    authorSelect.append(new Option("Wähle einen Autor :)", authorsArr.length, chooseAuthor, chooseAuthor));
    ids[1] = chooseAuthor ? "x" : getRandomAuthor();

    if(!chooseAuthor) {
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
        if(preSelectedSelect.val() !== preSelected) {
            preSelected = preSelectedSelect.val();

            if(preSelected !== quote) {
                ids[0] = quotesArr.length;
            }
            if(preSelected !== author) {
                ids[1] = authorsArr.length;
            }

            displayQuote();
            updateUrl();
        }
    });
});

loadFiles();