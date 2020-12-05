const quoteText = $(".quote-text");
const quoteAuthor = $(".quote-author");

quoteText.text("");
quoteAuthor.text("");

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

    const rating = ratingJson[id] === undefined ? 0 : ratingJson[id];

    quoteText.text(theQuote);
    quoteText.attr("onClick", "window.location = getBaseUrl().replace('#/', '') + 'info/#/Zitat/' + " + ids[0] + ";");
    quoteAuthor.text("- " + theAuthor);
    quoteAuthor.attr("onClick", "window.location = getBaseUrl().replace('#/', '') + 'info/#/Autor/' + " + ids[1] + ";");

    $("meta[property='og:description']").remove();
    $("head").append("<meta property='og:description' content='" + theQuote + "\n- " + theAuthor + "'>" );

    quoteId.text(id);
    if (rating !== oldRating) {
        quoteRating.text(rating === 0 ? "—" : Math.abs(rating) + " x   ");
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

    nextQuote.attr("href", getNewZitatUrl());
    tweetButton.textContent = "";
    tweetButton.attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent('"' + theQuote + '" - ' + theAuthor + "\nGenerated by " + window.location.href));
}

function getUrlWithId(value) {
    let rating = getRatingParam();
    return getBaseUrl() + "#/" + value + (rating === "w" || rating === "" ? "" : "?rating=" + rating);
}

function getUrlWithRating(value) {//w; all; rated; n
    return getBaseUrl() + "#/" + id + (value === "w" || value === "" ? "" : "?rating=" + value);
}

function getRandomZitatId() {
    return getRandomQuote() + "-" + getRandomAuthor();
}

function getNewZitatUrl() {
    const ratingParam = getRatingParam();

    if (ratingParam !== "all") {
        const keys = [];
        Object.keys(ratingJson).forEach((key, index) => {
            if (key !== id
                && ((ratingParam === "w" && ratingJson[key] > 0)
                    || (ratingParam === "n" && ratingJson[key] < 0)
                    || (ratingParam === "rated" && ratingJson[key] !== 0)
                    || (ratingParam === "unrated" && ratingJson[key] === 0)
                )) {
                keys.push(key);
            }
        });
        
        if (keys.length > 0) {
            return getUrlWithId(keys[Math.floor(Math.random() * keys.length)]);
        }
    }

    let newId;
    do {
        newId = getRandomZitatId();
    } while (newId === id);

    return getUrlWithId(newId);
}

function isValidId(val) {
    if (!(isNullOrUndefined(val) || val === "")) {
        if (id_regex.test(val)) {
            if (hasLoaded()) {
                const ids = val.split("-");
                return ids[0] < quotesArr.length && ids[1] < authorsArr.length;
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
        openPrivateUrl(getNewZitatUrl());
        return false;
    }
    return true;
}

function getRatingParamFromURL(){
    return getParamFromURL("rating", "w");
}

function getRatingParam() {
    const urlRating = getRatingParamFromURL();
    return urlRating === "w" ? ratingParam.val() : urlRating;
}

function updateRatingFromURL() {
    setSelection(ratingParam, getRatingParamFromURL(), "w");
}

updateRatingFromURL();

ratingParam.change(function () {
    openPrivateUrl(getUrlWithRating(ratingParam.val()));
});

$(".download").on("click", saveAsImg);

//starts loading process:
loadFiles();