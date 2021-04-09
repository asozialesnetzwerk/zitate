const quotesApi = "https://zitate.prapsschnalinen.de/api/";

let authorsJson;
let quotesJson;
let ratingJson;
let idJson;

$(document).ready(function () {
    $(".select").niceSelect();
});

function hasLoaded() {
    return !(
        isEmptyOrUndefinedObject(authorsJson)
        || isEmptyOrUndefinedObject(quotesJson)
        || isEmptyOrUndefinedObject(ratingJson)
        || isEmptyOrUndefinedObject(idJson)
    );
}

function loadFiles() {
    if (hasLoaded()) {
        runCode();
        return;
    }

    authorsJson = getObjectFromLocalStorageOrDefault("authorsJson", {});
    quotesJson = getObjectFromLocalStorageOrDefault("quotesJson", {});
    ratingJson = getObjectFromLocalStorageOrDefault("ratingJson", {});
    idJson = getObjectFromLocalStorageOrDefault("idJson", {});

    if (hasLoaded()) {
        runCode();
    }

    updateData(() => runCode());
}

function getObjectFromLocalStorageOrDefault(key, defaultVal) {
    const val = localStorage.getItem("zitate:" + key);
    if (isNullOrUndefined(val)) {
        return defaultVal;
    } else {
        return JSON.parse(val);
    }
}

function putObjectLocalStorage(key, value) {
    localStorage.setItem("zitate:" + key, JSON.stringify(value));
}

function saveToLocalStorage() {
    putObjectLocalStorage("authorsJson", authorsJson);
    putObjectLocalStorage("quotesJson", quotesJson);
    putObjectLocalStorage("ratingJson", ratingJson);
    putObjectLocalStorage("idJson", idJson);
}

function updateData(after) {
    let time = window.performance.now();

    const promises = [];

    promises.push(quotesApiGetRequest("wrongquotes", "&no_text=true"));
    promises.push(quotesApiGetRequest("quotes"));
    promises.push(quotesApiGetRequest("authors"));

    Promise.all(promises).then(() => {
        saveToLocalStorage();
        console.log("requested data from quotes api in " + (window.performance.now() - time) + "ms");
        if (typeof after === "function") {
            after();
        }
    });
}

function handleQuoteApiData(data) {
    if (typeof data === "object") {
        if (Array.isArray(data)) {
            for (let item of data) {
                handleQuoteApiData(item);
            }
            return;
        } else if (typeof data.id === "number") {
            if (typeof data["rating"] === "undefined") {
                if (typeof data["quote"] === "undefined") { //is not quote
                    if (typeof data["author"] === "string") { //is author
                        data["author"] = firstCharToUppercase(data["author"]);
                        authorsJson[data.id] = data;
                        return;
                    }
                } else if (typeof data["quote"] === "string") { //is quote
                    data["author"]["author"] = firstCharToUppercase(data["author"]["author"]);
                    quotesJson[data.id] = data;
                    return;
                }
            } else { //is wrong quote
                const a = data["author"];
                const q = data["quote"];

                const id = q.id + "-" + a.id;
                ratingJson[id] = data["rating"];

                idJson[id] = data.id;

                if (typeof a["author"] !== "undefined") {
                    handleQuoteApiData(a);
                }
                if (typeof q["quote"] !== "undefined") {
                    handleQuoteApiData(q);
                }
                return;
            }
        }
    }
    console.log("invalid package")
    console.log(data);
}

function firstCharToUppercase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAuthorById(authorId) {
    return authorsJson[authorId];
}

function getQuoteById(quoteId) {
    return quotesJson[quoteId];
}

function changeVisibility(element, visible) {
    const isVisible = !element.hasClass("invisible");
    if (visible === isVisible) {
        return;
    }
    if (visible && !isVisible) {
        element.removeClass("invisible");
    } else if (!visible && isVisible) {
        element.addClass("invisible");
    }
}

function isEmptyOrUndefinedObject(obj) {
    return isNullOrUndefined(obj) || Object.keys(obj).length === 0;
}

function isNullOrUndefined(obj) {
    return obj === null || typeof obj === "undefined";
}

function setSelection(selectElement, selection, defaultSelection) {
    selectElement.val(selection);
    if (selectElement.val() === null) {
        if (isNullOrUndefined(defaultSelection)) {
            return;
        }
        selectElement.val(defaultSelection);
    }
    selectElement.niceSelect("update");
}

function windowIsLandscape() {
    return window.innerWidth > window.innerHeight;
}

function openUrl(url) {
    window.location.href = url;
}

function getUrl() {
    return window.location.href;
}

function getBaseUrl() {
    let url = getUrl();
    getUrl().toLowerCase().replace(/.+\/zitate/, (match) => {
        url = match + "/";
    });
    return url;
}

function getRandomQuoteId() {
    const keys = Object.keys(quotesJson);
    return keys[Math.floor(keys.length * Math.random())];
}

function getRandomAuthorId() {
    const keys = Object.keys(authorsJson);
    return keys[Math.floor(keys.length * Math.random())];
}

function openPrivateUrl(url) {
    history.replaceState("", url, url);
}

function generateMailToLink(id, isAuthor) {
    let subject;
    let body = "Wie es zurzeit ist:\n";
    if (typeof id === "string" && id.indexOf("-") !== -1) { // report whole quote
        subject = `Falsches Zitat ${id} enthält Fehler.`
        const ids = id.split("-");
        body += `»${getQuoteById(ids[0]).quote}« (${ids[0]})\n - ${getAuthorById(ids[1]).author} (${ids[1]})`;
    } else if (isAuthor) {
        subject = `Autor ${id} enthält Fehler.`
        body += getAuthorById(id).author;
    } else {
        subject = `Zitat ${id} enthält Fehler.`;
        const quote = getQuoteById(id);
        body += `»${quote.quote}« (${quote.id})\n - ${quote.author.author} (${quote.author.id})`;
    }

    body += "\n\nWie es sein sollte:\n"

    return `mailto:contact@asozial.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function getParamFromURL(param, defaultValue) {
    let results = new RegExp("[\?&]" + param + "=([^&#]*)").exec(getUrl());
    return isNullOrUndefined(results) ? defaultValue : results[1];
}

function quotesApiGetRequest(endPoint, arg) {
    return new Promise(resolve => {
        $.getJSON(quotesApi + endPoint
            + "?r=" + encodeURI(Math.floor(new Date().getTime() / (60 * 60 * 1000)).toString(16)) //use different url every hour
            + (isNullOrUndefined(arg) ? "" : arg), "", data => {
            handleQuoteApiData(data);
            resolve();
        }, "json");
    });
}

// some helpful functions if you want to get some information:
function getAllQuoteObjects() {
    return Object.values(quotesJson);
}

function getAllRealQuotes(quoteArr) {
    const val = [];
    let quotes;
    if (quoteArr) {
        quotes = quoteArr;
    } else {
        quotes = getAllQuoteObjects();
    }
    for (const quote of quotes) {
        val.push(`"${quote.quote}" (${quote.id}) - ${quote.author.author} (${quote.author.id})`)
    }
    return val;
}

function getAllRealQuotesAsString() {
    return getAllRealQuotes().join("\n");
}

function getAllQuotes() {
    const val = [];
    for (const quote of getAllQuoteObjects()) {
        val.push(quote.quote + " (" + quote.id + ")");
    }
    return val;
}

function getAllQuotesAsString() {
    return getAllQuotes().join("\n");
}

function getAllAuthorObjects() {
    return Object.values(authorsJson);
}

function getAllAuthors() {
    const val = [];
    for (const author of getAllAuthorObjects()) {
        val.push(author.author + " (" + author.id + ")");
    }
    return val;
}

function getAllAuthorsAsString() {
    return getAllAuthors().join("\n");
}

function getQuotesByAuthorId(authorId) {
    return getAllQuoteObjects().filter(q => q.author.id === authorId);
}

function searchReplace(str) {
    return str.toLowerCase()
        .replace("c", "k")
        .replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
        .replace("é", "e")
        .replaceAll(/d\w{2}[^\w]/gm, "der ")
        //replace everything except letters with spaces:
        .replaceAll(/[^a-z ]+/gm, "");
}

function search(str, arr, fieldToSearch, match) {
    const re = searchReplace(str);

    if (match) {
        return arr.filter(o => str === o[fieldToSearch] || searchReplace(o[fieldToSearch]) === re);
    }
    let result = arr.filter(o => searchReplace(o[fieldToSearch]).indexOf(re) !== -1);

    if (result.length > 0) {
        return result;
    }

    const reArr = re.split(" ");

    return arr.filter(o => {
        const oStr = searchReplace(o[fieldToSearch]);
        for (const el of reArr) {
            if (oStr.indexOf(" " + el) === -1) {
                // an element in the array isn't in the replaced string
                return false;
            }
        }
        return false;
    });
}

function searchQuotes(str) {
    return search(str, getAllQuoteObjects(), "quote");
}

function searchAuthors(str) {
    return search(str, getAllAuthorObjects(), "author");
}

function findDuplicates(arr, field) {
    const dupes = [];
    for (const el of arr) {
        const duplicates = search(el[field], arr, field, true);
        if (duplicates.length > 1) {
           const ids = [];
           for (const d of duplicates) {
               ids.push(d.id);
           }
           ids.sort();
           const str = ids.join(" ≙ ");
           if (!dupes.includes(str)) {
               dupes.push(str);
               console.log(duplicates);
           }
        }
    }
    return dupes;
}


