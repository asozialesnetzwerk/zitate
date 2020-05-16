const quoteText = $(".quote-text");
const quoteAuthor = $(".quote-author");
const quoteRating = $(".quote-rating");
const ratingParam = $(".rating-param");

quoteText.text("");
quoteAuthor.text("");

$(document).ready(function () {
    $('select').niceSelect();
});

const rating = "bewertung_zitate.json";
const authors = "namen.txt";
const quotes = "zitate.txt";

window.q = [];
window.r = [];

var id;
const app = $.sammy(function() {
    this.get("#/:id", function() {
        id = this.params['id'];
        displayZitat();
    });
});
app.run();

function getUrlVars() {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function saveAsImg() {
    html2canvas(document.getElementById('quote-important'), {scrollX: 0,scrollY: -window.scrollY, allowTaint: true, backgroundColor: "#000000"}).then(function (canvas) {
        let a = document.createElement("a"); //Create <a>
        a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'); //Image Base64
        a.download = "Zitat_(" + id + ")_asozialesnetzwerk.github.io.png"; //File name
        a.click(); //Downloaded file
    });
}

function getUrlParam(parameter, defaultvalue) {
    if (window.location.href.indexOf(parameter) > -1) {
        return getUrlVars()[parameter];
    } else {
        return defaultvalue;
    }
}

function displayZitat() {
    if(id === undefined || id === "" || !(window.q.length === 2 && window.r.length === 1)) return;
    $(".get-quote").attr("href", getZitatUrl());


    const ids = id.split("-");
    
    let theQuote = window.q[1][ids[0]] ;
    const theAuthor = window.q[0][ids[1]];
    theQuote = "»" + theQuote.substr(1, theQuote.lastIndexOf('"') - 1) + "«";

    const ratingUndefined = window.r[0][id] === undefined;
    const rating = ((ratingUndefined) ? 0 : window.r[0][id]);
    
    quoteText.text(theQuote);
    quoteText.attr("onClick", "window.open('https://ddg.gg/?q=" +  encodeURIComponent(theQuote) + "')");
    quoteAuthor.text("- " + theAuthor);
    quoteAuthor.attr("onClick", "window.open('https://ddg.gg/?q=" +  encodeURIComponent(theAuthor) + "')");

    $('meta[property="og:description"]').remove();
    $('head').append('<meta property="og:description" content=\'' + theQuote + '\n- ' + theAuthor + '\'>' );

    $(".quote-id").text(id);
    quoteRating.text((ratingUndefined) ? "—" : Math.abs(window.r[0][id]) + " x   ");
    quoteRating.append((ratingUndefined) ? '' : '<img class="rating-image" src="css/Stempel' + ((rating < 0) ? 'Nicht' : '') + 'Witzig.svg" onload="SVGInject(this)"/>'); //width="auto" height="42"    onerror="SVGInject.err(this, "image.png")

    const ratingImage = $(".rating-image");
    if (rating < 0) {
        ratingImage.css("bottom","0.008rem");
        ratingImage.css("fill", "#DC143C"); //$(".rating-image").css("filter", "brightness(0) invert(1) sepia(1000) saturate(10000) hue-rotate(107deg) invert(84%) brightness(69%)"); //"-webkit-filter"
    } else {
        ratingImage.css("top","0.01rem");
        if (rating > 0) {
            ratingImage.css("fill", "#228B22"); //$(".rating-image").css("filter", 'brightness(0) invert(1) sepia() saturate(10000%) hue-rotate(30deg) brightness(60%)'); //"-webkit-filter"
        } else {
            ratingImage.css("fill", "#b8b7b6");
        }
    }

    $(".tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent(theQuote + ' - ' + theAuthor + "\nGenerated by " + window.location.href));
}

function getUrlWithoutParam() {
    let url = window.location.href;
    window.location.href.toLowerCase().replace(/.+\/zitate\//, function (match) {
        url =  match + "#/";
    });
    return url;
}

function getUrlWithId(value) {
    let rating = getUrlParam("rating", "");
    return getUrlWithoutParam() + value + (rating === "" ? "" : "?rating=" + rating);
}

function getUrlWithRating(value) {//w; all; rated; n
    return getUrlWithoutParam()  + id + (value === "" ? "" : "?rating=" + value);
}

function getRandomZitatId() {
    return Math.floor(Math.random() * window.q[1].length) + '-' + Math.floor(Math.random() * window.q[0].length);
}

function getZitatUrl() {
    const paramRating = getUrlParam("rating", "w");
    if (paramRating === "all") {
        return getUrlWithId(getRandomZitatId());
    }
    const keys = Object.keys(window.r[0]);
    let z;
    do {
        z = Math.floor(Math.random() * keys.length);
    } while ((window.r[0][keys[z]] <= 0 && paramRating === "w") || (window.r[0][keys[z]] >= 0 && paramRating === "n") || (window.r[0][keys[z]] === 0 && paramRating === "rated")); //Bis richtiges Zitat gefunden
    
    return getUrlWithId(keys[z]);
}

function checkId() {
    if(id === undefined || id === "") {
        id = getUrlParam("id", "");
        if(id !== "") {
            window.location = getUrlWithId(id);
        }
    }
}

function checkLoad() {
    if (window.q.length === 2 && window.r.length === 1) {
        checkId();
        if (id.indexOf('-') < 1) window.location = getZitatUrl();
        else {
            displayZitat();
        }
    }
}

const getQuote = function (data) {
    window.q.push(data.split(/\n/));
    checkLoad();
};

const getRating = function (data) {
    window.r.push(JSON.parse(data));
    checkLoad();
};

$.get(rating, getRating, 'text');
$.get(authors, getQuote, 'text');
$.get(quotes, getQuote, 'text');

ratingParam.val(getUrlParam("rating", "w"));
if(ratingParam.val() === null) window.location = getUrlWithRating("w");

ratingParam.change(function () {
    if (!(ratingParam.val() === "" || ratingParam.val() === getUrlParam("rating", "text"))) {
        window.location = getUrlWithRating(ratingParam.val());
    }
});

$(".download").on("click", function() {
	saveAsImg();
});