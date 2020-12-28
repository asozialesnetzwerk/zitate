const quotesApi = "https://zitate.prapsschnalinen.de/api/";

let authorsJson;
let quotesJson;
let ratingJson;
let idJson;

$(document).ready(function () {
    $(".select").niceSelect();
});

function hasLoaded() {
    return !(authorsJson === undefined || quotesJson === undefined || ratingJson === undefined);
}

function loadFiles() {
    if (hasLoaded()) {
        runCode();
        return;
    }

    updateData(() => runCode());
}

function updateData(after) {
    authorsJson = {};
    quotesJson = {};
    ratingJson = {};
    idJson = {};

    let time = window.performance.now();

    const promises = [];

    promises.push(quotesApiGetRequest("wrongquotes"));
    promises.push(quotesApiGetRequest("quotes"));
    promises.push(quotesApiGetRequest("authors"));

    Promise.all(promises).then(() => {
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
                    if (typeof data["author"] !== "undefined") { //is author
                        authorsJson[data.id] = data;
                        return;
                    }
                } else { //is quote
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

function quotesApiGetRequest(endPoint) {
    return new Promise(resolve => {
        $.getJSON(quotesApi + endPoint + "?r=" + encodeURI(new Date().getTime().toString(16)), "", data => {
            let time = window.performance.now();
            handleQuoteApiData(data);
            console.log(endPoint + (window.performance.now() - time) + "ms");
            resolve();
        }, "json");
    });
}

/*
const promises = [];
let authorsArr;
promises.push(new Promise(resolve => {$.get("../namen.txt", data => {authorsArr = data.split(/\n/);resolve()}, "text")}));
let quotesArr;
promises.push(new Promise(resolve => {$.get("../zitate.txt", data => {quotesArr = data.split(/\n/);resolve()}, "text")}));
let bewertung;
promises.push(new Promise(resolve => {$.get("../bewertung_zitate.json", data => {bewertung = data;resolve()}, "json")}));
Promise.all(promises).then(() => {
    const strBuilder = [];
    for (let key in bewertung) {
        if (bewertung[key] > 0) {
            let q = quotesArr[key.split("-")[0]].trim();
            q = q.substr(1, q.length - 2);
            if (q.indexOf(",") !== -1) q = '"' + q + '"';
            let a = authorsArr[key.split("-")[1]];
            if (a.indexOf(",") !== -1) a = '"' + a + '"';
            strBuilder.push(q, "," , a, "\n");
        }
    }
    console.log(strBuilder.join(""));
});
*/