let authorsArr;
let quotesArr;
let ratingJson;

$(document).ready(function () {
    $("select").niceSelect();
});

function hasLoaded() {
    return !(authorsArr === undefined || quotesArr === undefined || ratingJson === undefined);
}

function checkStart() {
    if(hasLoaded()) {
        runCode();
    }
}

function loadFiles() {
    if(hasLoaded()) {
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
    if(visible === isVisible) {
        return;
    }
    if(visible && !isVisible) {
        element.removeClass("invisible");
    } else if (!visible && isVisible) {
        element.addClass("invisible");
    }
}

function setSelection(selectElement, selection, defaultSelection) {
    selectElement.val(selection);
    if(selectElement.val() === null) {
        if(defaultSelection === undefined || defaultSelection === null) {
            return;
        }
        selectElement.val(defaultSelection);
    }

    selectElement.niceSelect("update");
}

function windowIsLandscape() {
    return window.innerWidth > window.innerHeight;
}

function openPrivateUrl(url) {
    history.replaceState("", url, url);
}