const select = $("select");

let authorsArr = [];
let quotesArr = [];
let ratingJson = null;

$(document).ready(function () {
    select.niceSelect();
});

function hasLoaded() {
    return authorsArr.length > 0 && quotesArr.length > 0 && ratingJson !== null;
}

function checkStart() {
    if(hasLoaded()) {
        runCode();
    }
}

function loadFiles() {
    $.getJSON(ratingSource, data => {
        ratingJson = data;
        checkStart();
    }, "text");

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
        if(defaultSelection === undefined) {
            return;
        }
        selectElement.val(defaultSelection);
        selection = defaultSelection;
    }

    for (let i = 0; i < selectElement.children().length; i++) {
       if(selectElement.children()[i].value === selection) {
           selectElement.children()[i].className ="selected";
       } else {
           selectElement.children()[i].className = "";
       }
    }

    select.niceSelect("update");
}
