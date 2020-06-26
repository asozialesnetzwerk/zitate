const selectType = $(".select");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const tweetButton = $(".tweet");

const quoteSelect = $(".quote-select");
const authorSelect = $(".author-select");
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
        setSelection(selectType, preSelected);

        const idsParam = this.params["id"].split("-");

        ids[0] = idsParam[0] === "" ? "x" : idsParam[0];
        ids[1] = idsParam[1] === "" || idsParam[1] === null ? "x" : idsParam[1];

        if(quoteSelect.val() !== ids[0]) {
            quoteSelect.val(ids[0] === "x" ? quotesArr.length : ids[0]).trigger("change");
        }

        if(authorSelect.val() !== ids[1]) {
            authorSelect.val(ids[1] === "x" ? authorsArr.length : ids[1]).trigger("change");
        }

        nextQuote.href = getBaseUrl() + "goq/#/" + (preSelected !== none && preSelected === author ? getRandomQuote() : quotesArr.length) + "-" + (preSelected !== none && preSelected === quote ? getRandomAuthor() : authorsArr.length)  + "?pre=" + preSelected;
        tweetButton.href = getBaseUrl() + "#/" + getId();

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
        changeVisibility(quoteSelect, true);
        changeVisibility(quoteText, false);
        quoteText.text("");
    } else {
        changeVisibility(quoteSelect, false);
        changeVisibility(quoteText, true);
        quoteText.text(quotesArr[ids[0]]);
    }

    if(preSelected === author) {
        changeVisibility(authorSelect, true);
        changeVisibility(authorText, false);
        authorText.text("");
    } else {
        changeVisibility(authorSelect, false);
        changeVisibility(authorText, true);
        authorText.text(authorsArr[ids[1]]);
    }
}

function updateUrl() {
    openPrivateUrl(getBaseUrl() + "goq/#/" + getId() + "?pre=" + preSelected);
    quoteId.text(getId());
}

function runCode() {
    for (let i = 0; i < quotesArr.length; i++) {
        quoteSelect.append(new Option(quotesArr[i], i.toString(), false, false));
    }

    if(preSelected === none || preSelected === quote) {
        quoteSelect.append(new Option("Wähle ein Zitat :)", quotesArr.length, true, true));
        ids[0] = "x";
    }

    for (let i = 0; i < authorsArr.length; i++) {
        authorSelect.append(new Option(authorsArr[i], i.toString(), false, false));
    }

    if(preSelected === none || preSelected !== author) {
        authorSelect.append(new Option("Wähle einen Autor :)", authorsArr.length, true, true));
        ids[1] = "x";
    }

    quoteSelect.trigger("change");
    authorSelect.trigger("change");

    quoteSelect.change(function() {
        ids[0] = quoteSelect.val() === quotesArr.length.toString() ? "x" : quoteSelect.val();
        console.log("Quote: " + ids[0]);
        updateUrl();
    });

    authorSelect.change(function() {
        ids[1] = authorSelect.val() === authorsArr.length.toString() ? "x" : authorSelect.val();
        console.log("Author: " + ids[1]);
        updateUrl();
    });

    displayQuote();
    updateUrl();
}

$(document).ready(function() {
    $('.search-select').select2();
});

loadFiles();