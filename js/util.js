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