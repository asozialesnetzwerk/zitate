let authorsArr;
let quotesArr;
let ratingJson;

$(document).ready(function () {
    $(".select").niceSelect();
});

function hasLoaded() {
    return !(authorsArr === undefined || quotesArr === undefined || ratingJson === undefined);
}

function checkStart() {
    if (hasLoaded()) {
        runCode();
    }
}

function loadFiles() {
    if (hasLoaded()) {
        runCode();
        return;
    }

    $.getJSON(ratingSource, data => {
        ratingJson = data;
        checkStart();
    }, "json");

    $.get(authorsSource, data => {
        authorsArr = data.split(/\n/);
        checkStart();
    }, "text");


    $.get(quotesSource, data => {
        quotesArr = data.split("\n");
        checkStart();
    }, "text");
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
    getUrl().toLowerCase().replace(/.+\/zitate/, function (match) {
        url = match + "/";
    });
    return url;
}

function getRandomQuote() {
    return Math.floor(quotesArr.length * Math.random());
}

function getRandomAuthor() {
    return Math.floor(authorsArr.length * Math.random());
}

function openPrivateUrl(url) {
    history.replaceState("", url, url);
}

function getParamFromURL(param, defaultValue) {
    let results = new RegExp("[\?&]" + param + "=([^&#]*)").exec(window.location.href);
    return results === null ? defaultValue : results[1];
}