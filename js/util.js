let authorsArr = [];
let quotesArr = [];
let ratingJson = null;

function hasLoaded() {
    return authorsArr.length > 0 && quotesArr.length > 0 && ratingJson !== null;
}

$.ajaxSetup({
    async: false
});

$.getJSON(ratingSource, data => {
    ratingJson = data;
}, "text");

$.get(authorsSource, data => {
    authorsArr = data.split(/\n/);
}, "text");


$.get(quotesSource,data => {
    quotesArr = data.split("\n");
}, "text");

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
