const quotesApi = "https://zitate.prapsschnalinen.de/api/";

let authorsArr;
let quotesArr;
let ratingJson;
let idJson;

$(document).ready(function () {
    $(".select").niceSelect();
});

function hasLoaded() {
    return !(authorsArr === undefined || quotesArr === undefined || ratingJson === undefined);
}

function loadFiles() {

    if (hasLoaded()) {
        runCode();
        return;
    }

    updateData(() => runCode());
}

function updateData(after) {
    quotesApiGetRequest("wrongquotes", data => {
        authorsArr = [];
        quotesArr = [];
        ratingJson = {};
        idJson = {};
        for (let i = 0; i < data.length; i++) {
            addData(data[i], i);
        }
        authorsArr.sort((a, b) => a.id - b.id);
        quotesArr.sort((a, b) => a.id - b.id);

        if (typeof after === "function") {
            after();
        }
    });
}

function addData(data, i) {
    const quote = data;
    const a = quote["author"];
    addValToArr(a, authorsArr);
    const q = quote["quote"];
    addValToArr(q, quotesArr);
    addValToArr(q["author"], authorsArr);

    const id = q.id + "-" + a.id;
    ratingJson[id] = quote["rating"];

    console.log(data);

    idJson[id] = i + 1;
}

function addValToArr(val, arr) {
    if (binarySearch(arr, val.id) === -1) { //if the id of the val isn't already in the arr
        arr.push(val);
    }
}

const getAuthorById = authorId => {
    const a = authorsArr[authorId - 1];
    if (a.id == authorId) {
        return a;
    }
    const index = binarySearch(authorsArr, authorId);
    if (index === -1) {
        return undefined;
    }
    return authorsArr[index];
};

function getQuoteById(quoteId) {
    const q = quotesArr[quoteId - 1];
    if (q.id == quoteId) {
        return q;
    }
    const index = binarySearch(quotesArr, quoteId);
    if (index === -1) {
        return undefined;
    }
    return quotesArr[index];
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

function getRandomQuote() {
    return quotesArr[Math.floor(quotesArr.length * Math.random())].id;
}

function getRandomAuthor() {
    return authorsArr[Math.floor(authorsArr.length * Math.random())].id;
}

function openPrivateUrl(url) {
    history.replaceState("", url, url);
}

function getParamFromURL(param, defaultValue) {
    let results = new RegExp("[\?&]" + param + "=([^&#]*)").exec(window.location.href);
    return results === null ? defaultValue : results[1];
}

function quotesApiGetRequest(endPoint, callbackFunction) {
    $.getJSON(quotesApi + endPoint + "?r=" + encodeURI(new Date().getTime().toString(16)), "", callbackFunction, "json");
}

function binarySearch(arr, toSearch) {
    let start = 0;
    let end = arr.length - 1;
    // Iterate while start not meets end
    while (start <= end) {
        // Find the mid index
        let mid = Math.floor((start + end) / 2);
        // If element is present at mid, return the position
        if (arr[mid].id == toSearch)
            return mid;
        // Else look in left or right half accordingly
        else if (arr[mid].id < toSearch)
            start = mid + 1;
        else
            end = mid - 1;
    }
    return -1;
}