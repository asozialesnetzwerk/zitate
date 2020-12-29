const quoteText = $(".quote-text");
const quoteAuthor = $(".quote-author");

const ratingParam = $(".rating-param");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const tweetButton = $(".tweet");
const quoteRating = $(".rating-text");
const witzig = $(".witzig");
const nichtWitzig = $(".nicht-witzig");

const id_regex = /^\d{1,4}-\d{1,4}$/; //1234-1234


let id;

const app = $.sammy(function() {
    this.get("#/:id", function() {
        id = this.params["id"];
        updateRatingFromURL();
        runCode();
    });


    this.get("/:id", function() {
        id = this.params["id"];
        updateRatingFromURL();
        runCode();
    });

    this.get("/#", function () {
        checkId();
    });
});
app.run();

function saveAsImg() {
    html2canvas(
        document.getElementById("quote-important"), {
            scrollX: 0,
            scrollY: -window.scrollY,
            allowTaint: true,
            backgroundColor: "#000000",
        }).then(function (canvas) {
            let a = document.createElement("a"); //Create <a>
            a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); //Image Base64
            a.download = "Zitat_(" + id + ")_asozialesnetzwerk.github.io.png"; //File name
            a.click(); //Downloaded file
        });
}

let oldRating;
//displays Quote:
function runCode() {
    if (!hasLoaded() || !checkId()) return;

    const ids = id.split("-");

    let theQuote =  "»" + getQuoteById(ids[0])["quote"]  + "«";
    const theAuthor = getAuthorById(ids[1])["author"];

    quoteText.text(theQuote);
    quoteText.attr("onClick", "window.location = getBaseUrl().replace('#/', '') + 'info/#/Zitat/' + " + ids[0] + ";");
    quoteAuthor.text("- " + theAuthor);
    quoteAuthor.attr("onClick", "window.location = getBaseUrl().replace('#/', '') + 'info/#/Autor/' + " + ids[1] + ";");

    $("meta[property='og:description']").remove();
    $("head").append("<meta property='og:description' content='" + theQuote + "\n- " + theAuthor + "'>" );

    quoteId.text(id);

    const rating = ratingJson[id] === undefined ? 0 : ratingJson[id];
    if (rating !== oldRating) {
        quoteRating.text(rating === 0 ? "—" : Math.abs(rating) + " x");
        if ( rating === 0) {
            changeVisibility(witzig, false);
            changeVisibility(nichtWitzig, false);
        } else {
            if (rating < 0) {
                changeVisibility(witzig, false);
                changeVisibility(nichtWitzig, true);
            } else {
                changeVisibility(witzig, true);
                changeVisibility(nichtWitzig, false);
            }
        }
    }
    oldRating = rating;

    nextQuote.attr("href", getNewZitatUrl(getRatingParamFromURL()));
    tweetButton.textContent = "";
    tweetButton.attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent('"' + theQuote + '" - ' + theAuthor + "\nGenerated by " + window.location.href));
}

function getUrlWithIdAndRating(value, rating) {
    return getBaseUrl() + "#/" + value + (rating === "smart" || rating === "" ? "" : "?rating=" + rating);
}

function getRandomZitatId() {
    while (true) {
        const qId = getRandomQuoteId();
        const aId = getRandomAuthorId();

        if (getQuoteById(qId)["author"].id !== aId) {
            return qId + "-" + aId;
        }
    }
}

function getNewZitatUrl(ratingParam) {
    const param = ratingParam;
    if (ratingParam === "smart") {
        const r = Math.floor(Math.random() * 28)
        if (r < 2) { // 0 - 1 → 2 → ~7.14%
            ratingParam = "n";
        } else if (r < 9) { // 2 - 8 → 7 → 25%
            ratingParam = "unrated";
        } else if (r < 15) { // 9 - 14 → 6 → ~21.43%
            ratingParam = "all";
        } else { // 15 - 27 → 13 → 46.43%
            ratingParam = "w";
        }
        console.log(ratingParam);
    }

    if (ratingParam !== "all") {
        let keys = Object.keys(ratingJson).filter(getKeyFilter(ratingParam));
        
        if (keys.length > 0) {
            return getUrlWithIdAndRating(keys[Math.floor(Math.random() * keys.length)], param);
        }
    }

    let newId;
    do {
        newId = getRandomZitatId();
    } while (newId === id);

    return getUrlWithIdAndRating(newId, param);
}

function getKeyFilter(ratingParam) {
    switch (ratingParam) {
        case "unrated": return (key) => key !== id && ratingJson[key] === 0;
        case "w": return (key) => key !== id && ratingJson[key] > 0;
        case "n": return (key) => key !== id && ratingJson[key] < 0;
        case "rated": return (key) => key !== id && ratingJson[key] !== 0;
        default: return (key) => key !== id;
    }
}

function isValidId(val) {
    if (!(isNullOrUndefined(val) || val === "")) {
        if (id_regex.test(val)) {
            if (hasLoaded()) {
                const ids = val.split("-");
                return !isNullOrUndefined(getQuoteById(ids[0])) && !isNullOrUndefined(getAuthorById(ids[1]));
            } else {
                return true;
            }
        }
    }
    return false;
}

function checkId() {
    if (!isValidId(id)) {
        if (id !== undefined && id !== null) {
            console.log("Given id (" + id + ") is invalid.");
        }
        openPrivateUrl(getNewZitatUrl(getRatingParamFromURL()));
        return false;
    }
    return true;
}

function getRatingParamFromURL(){
    return getParamFromURL("rating", "smart");
}

function updateRatingFromURL() {
    setSelection(ratingParam, getRatingParamFromURL(), "smart");
}

updateRatingFromURL();

function voteQuote(vote) {
    if (typeof vote !== "number"
        || vote === 0
        || typeof id !== "string") {
        return;
    }
    vote = vote / Math.abs(vote);
    if (typeof (idJson[id]) === "undefined") {
        const ids = id.split("-");
        $.post(quotesApi + "wrongquotes", {
            contributed_by: "asozialesnetzwerk.github.io/discord",
            quote: ids[0],
            author: ids[1]
        }, function(data) {
            console.log(data);
            handleQuoteApiData(data);
            ratingRequest(vote);
        });
    } else {
        ratingRequest(vote);
    }
}

let voted = {};
function ratingRequest(vote) { //only call this in voteQuote()
    if (vote !== voted[id]) {
        voted[id] = vote;
        $.post(quotesApi + "wrongquotes/" + idJson[id], {
            vote: vote
        }, function (data) {
            handleQuoteApiData(data); //updates quote data
            runCode();
        });
    } else {
        alert("Du hast dieses falsche Zitat bereits mit " + vote + " bewertet");
    }
}

ratingParam.change(function () {
    openPrivateUrl(getNewZitatUrl(ratingParam.val()));
});

$(".download").on("click", saveAsImg);

//starts loading process:
loadFiles();