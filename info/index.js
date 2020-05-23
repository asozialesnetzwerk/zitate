const ratingSource = "../bewertung_zitate.json";
const authorsSource = "../namen.txt";
const quotesSource = "../zitate.txt";

const list = document.getElementById("list");

let authorsArr = [];
let quotesArr = [];
let ratingJson = null;

let id;
const app = $.sammy(function() {
    this.get("#/:author/:id", function() {
        id = this.params["id"];

        if(this.params["author"] === "zitat") {
            id = id + "-";
        } else {
            id = "-" + id;
        }
        console.log("loaded");
        runInfo();
    });

    this.get("/", function () {
        window.location = getUrlWithId(Math.random() > 0.5, 69);
    });

    this.get("/#", function () {
        window.location = getUrlWithId(Math.random() > 0.5, 69);
    });
});
app.run();

function isAuthor(id) {
    return id.startsWith("-");
}
function hasLoaded() {
    return authorsArr.length > 0 && quotesArr.length > 0 && ratingJson !== null;
}

function getBaseUrl() {
    let url = window.location.href;
    window.location.href.toLowerCase().replace(/.+\/info/, function (match) {
        url =  match + "/#/";
    });
    return url;
}

function getUrlWithId(isAuthor, value) {
    if(isAuthor) {
        return getBaseUrl() + "autor/" + value;
    } else {
        return getBaseUrl + "zitat/" + value;
    }
}

function checkLoad() {
    if (hasLoaded()) {
        runInfo();
    }
}


$.get(ratingSource, data => {
    ratingJson = JSON.parse(data);
    checkLoad();
}, "text");

$.get(authorsSource, data => {
    authorsArr = data.split(/\n/);
    checkLoad();
}, "text");

$.get(quotesSource, data => {
    quotesArr = data.split(/\n/);
    checkLoad();
}, "text");


function getFalschesZitat(zitatId) {
    let ids = zitatId.split("-");
    if(ids.length < 2 || !hasLoaded()) return "";
    return quotesArr[ids[0]] + " -" + authorsArr[ids[1]];
}


function runInfo() {
    if(!hasLoaded() || typeof id === "undefined") return;

    const keys = Object.keys(ratingJson);

    //<works>
    let regexId;
    if(isAuthor(id)) {
        //URL should end with: /zitate/info/#/zitat/69
        regexId = new RegExp("^\\d{0,4}" + id + "$")
    } else {
        //URL should end with: /zitate/info/#/autor/69
        regexId = new RegExp("^" + id + "\\d{0,4}$");
    }

    const zitatIdArr = keys.filter(s => regexId.test(s)).sort((a, b) => ratingJson[b] - ratingJson[a]); //filters all which contain author/quote
    //</works>

    list.childNodes.forEach(node => {
        list.removeChild(node); //klappt nicht immer
    });

    if(zitatIdArr.length === 0) {
        const element = document.createElement("li");
        element.appendChild(document.createTextNode("Es wurde kein bewertetes falsches Zitat mit folgendem " + (isAuthor( id) ? "Autor" : "Zitat") + " gefunden: " + (isAuthor(id) ? authorsArr[id.replace("-", "")] : quotesArr[id.replace("-", "")])));
        list.appendChild(element);
        return;
    }

    for (let i = 0; i < zitatIdArr.length; i++) {
        const element = document.createElement("li");
        element.appendChild(document.createTextNode(getFalschesZitat(zitatIdArr[i]) + " (" + zitatIdArr[i] + ": " + ratingJson[zitatIdArr[i]] + ")"));
        list.appendChild(element);
    }



    /*
    //not working:
    const newArr = {};
    for (let [key, value] of Object.entries(zitatIdArr)) {
        newArr[`"${value}"`] = authorsArr[`${value}`];
    }

    console.log(newArr);
    console.log(Object.values(newArr));

    console.log(Math.max(...Object.values(newArr))); //max


//console.log(Object.keys(newArr).find(key => newArr[key] === 7)); //only one result


    for (let [key, value] of Object.entries(newArr)) {
        if (value === Math.max(...Object.values(newArr))) {
            //console.log(`${key}`);
            console.log(`${key}`.substring(1, `${key}`.indexOf('-')));
        }
    }
    */
}
