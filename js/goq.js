const preSelectedSelect = $(".pre-selected-select");
const quoteId = $(".quote-id");
const nextQuote = $(".get-quote");
const tweetButton = $(".tweet");

const quoteSelectContainer = $(".quote-select-container");
const authorSelectContainer = $(".author-select-container");
const quoteSelect = $(".quote-select");
const authorSelect = $(".author-select");
const quoteText = $(".quote");
const authorText = $(".author");
const quoteInput = $(".quote-input");
const authorInput = $(".author-input");

const none = "n";
const quote = "z";
const author = "a";

const ids = ["x", "x"];
let preSelected = none;

const app = $.sammy(function() {
    this.get("/#/:id", function() {
        preSelected = getParamFromURL("pre", author).toLowerCase();
        setSelection(preSelectedSelect, preSelected);

        const idsParam = this.params["id"].split("-");

        ids[0] = idsParam[0] === "" || idsParam[0] === null || idsParam[0] === "null" ? "x" : idsParam[0];
        ids[1] = idsParam[1] === "" || idsParam[1] === null || idsParam[1] === "null" ? "x" : idsParam[1];

        if (preSelected === quote && ids[0] === "x") {
            ids[0] = getRandomQuoteId().toString();
        } else if (preSelected === author && ids[1] === "x") {
            ids[1] = getRandomQuoteId().toString();
        }

        if (quoteSelect.val() !== ids[0]) {
            quoteSelect.val(ids[0]).trigger("change");
        }

        if (authorSelect.val() !== ids[1]) {
            authorSelect.val(ids[1]).trigger("change");
        }

        displayQuote();
    });
});
app.run();

function getId() {
    return ids[0] + "-" + ids[1];
}

function displayQuote() {
    if (!hasLoaded()) return;
    if (isNullOrUndefined(quoteSelect.val())) {
        quoteSelect.val("x").trigger("change");
        ids[0] = "x";
    }
    if (isNullOrUndefined(authorSelect.val())) {
        authorSelect.val("x").trigger("change");
        ids[1] = "x";
    }

    quoteId.text(getId());

    const quoteIsSelected = preSelected === quote;
    changeVisibility(quoteSelectContainer, !quoteIsSelected);
    changeVisibility(quoteText, quoteIsSelected);
    quoteText.text(quoteIsSelected ? getQuoteById(ids[0])["quote"] : "");

    const authorIsSelected = preSelected === author;
    changeVisibility(authorSelectContainer, !authorIsSelected);
    changeVisibility(authorText, authorIsSelected);
    authorText.text(authorIsSelected ? "- " + getAuthorById(ids[1])["author"] : "");

    nextQuote.attr("href", getRandomUrl());
    tweetButton.attr("href", getBaseUrl() + getId());
}

function getRandomUrl() {
    let url = getBaseUrl() + "goq/#/";
    if (preSelected === quote) {
        url += getRandomQuoteId() + "-x";
    } else if (preSelected === author) {
        url += "x-" + getRandomAuthorId();
    } else {
        url += "x-x";
    }
    return url + "?pre=" + preSelected;
}

function updateUrl() {
    openPrivateUrl(getBaseUrl() + "goq/#/" + getId() + "?pre=" + preSelected);
    quoteId.text(getId());
}

const selectsHtml = {};
function resetQuoteOptions() {
    quoteSelect.empty();

    for (let q of Object.values(quotesJson)) {
        quoteSelect.append(new Option(q["quote"], q.id, false, false));
    }

    quoteSelect.append(new Option("Wähle ein Zitat :)", "x", true, true));

    selectsHtml["quote"] = quoteSelect.html();

    if (preSelected === quote) {
        quoteSelect.val(getRandomQuoteId().toString());
    }
    ids[0] = quoteSelect.val();

    quoteSelect.niceSelect('update');
}

function resetAuthorOptions() {
    authorSelect.empty();

    for (let a of Object.values(authorsJson)) {
        authorSelect.append(new Option(a["author"], a.id, false, false));
    }

    authorSelect.append(new Option("Wähle einen Autor :)", "x", true, true));

    selectsHtml["author"] = authorSelect.html();


    if (preSelected === author) {
        authorSelect.val(getRandomAuthorId().toString());
    }
    ids[1] = authorSelect.val();

    authorSelect.niceSelect('update');
}

function runCode() {
    resetQuoteOptions();
    resetAuthorOptions();

    console.log(ids);

    quoteSelect.trigger("change");
    authorSelect.trigger("change");

    $(".select-container").css("opacity", "100");

    displayQuote();
    updateUrl();
}

$(document).ready(function() {
    quoteSelect.change(function() {
        if (!isNullOrUndefined(quoteSelect.val())) {
            ids[0] = quoteSelect.val();
            updateUrl();
        }
    });

    authorSelect.change(function() {
        if (!isNullOrUndefined(authorSelect.val())) {
            ids[1] = authorSelect.val();
            updateUrl();
        }
    });

    const inputs = {"quote":quoteInput,"author":authorInput};
    const selects = {"quote":quoteSelect, "author":authorSelect}
    const oldValues = {"quote":"", "author":""};
    const intervals = {};

    function checkInput(type) {
        const newVal = inputs[type].val();
        if (oldValues[type] !== newVal) {
            const obj = findObject(type, newVal);
            console.log(obj);
            const select = selects[type];

            select.empty();
            select.append(selectsHtml[type]);

            if (obj.id === -1) {
                select.append(new Option(newVal, "-1", false, true));
            }

            select.niceSelect('update');
            setSelection(select, obj.id.toString());
        }
        oldValues[type] = newVal;
    }

    addInputListener("quote");
    addInputListener("author");
    function addInputListener(type) {
        inputs[type]
            .bind('mouseout keyup', function () {
                checkInput(type);
            })
            .bind('focus', function () {
                intervals[type] = setInterval(() => checkInput(type), 200);
            })
            .bind('blur', function () {
                clearInterval(intervals[type]);
                checkInput(type);
            });
    }

    preSelectedSelect.change(function () {
        if (preSelectedSelect.val() !== preSelected) {
            preSelected = preSelectedSelect.val();

            if (preSelected === quote) {
                if (quoteSelect.val() === "x") {
                    quoteSelect.val(getRandomQuoteId()).trigger("change");
                }
            } /*else {
                ids[0] = "x";
            } */

            if (preSelected === author) {
                if (authorSelect.val() === "x") {
                    authorSelect.val(getRandomAuthorId()).trigger("change");
                }
            } /*else {
                ids[1] = "x";
            }*/

            displayQuote();
            updateUrl();
        }
    });
});

loadFiles();

function findObject(type, str) {
    const isQuote = type === "quote";
    str = str.trim();
    const time = window.performance.now();
    const id = findStringInArr(Object.values(isQuote ? quotesJson : authorsJson), type, str);
    console.log(window.performance.now() - time);
    return id === -1
        ? {id: -1, type: str}
        : (isQuote
            ? getQuoteById(id)
            : getAuthorById(id)
        );
}

//to use in findStringInArr
function findInArr(arr, arrKey, str, optimizedStr) {
    str = str.toLowerCase();
    const iMap = {};

    const oBoo = typeof optimizedStr === "string";

    for (let i = 0; i < arr.length; i++){
        const elStr = arr[i][arrKey].toLowerCase();
        if (elStr === str) {
            return i;
        } else if (elStr.indexOf(str) !== -1) {
            iMap[i] = 3;
        } else if (oBoo) {
            let optimizedElStr = optimizeSearchParam(elStr);
            if (optimizedElStr === optimizedStr) {
                iMap[i] = 2;
            } else if (optimizedElStr.indexOf(optimizedStr) !== -1) {
                iMap[i] = 1;
            }
        }
    }
    return iMap;
}

function findStringInArr(arr, arrKey, str) {
    const optimizedStr = optimizeSearchParam(str);

    const iMap = findInArr(arr, arrKey, str, optimizedStr);

    if (typeof iMap === "number") {
        return arr[iMap].id;
    }

    let indexArr = Object.keys(iMap);

    if (indexArr.length === 0) {
        const strArr = optimizedStr.trim().split(/\s+/gm);

        if (strArr.length === 1) {
            return -1;
        }

        let notFoundCount = 0;
        for (let i = 0; i < strArr.length; i++) {
            const map = findInArr(arr, arrKey, strArr[i]);
            if (typeof map === "number") {
                iMap[map] += 3;
            } else {
                if (Object.keys(map).length === 0) {
                    console.log(strArr[i]);
                    if (++notFoundCount > 1) {
                        return -1;
                    }
                } else {
                    for (const mapKey in map) {
                        iMap[mapKey] = (typeof iMap[mapKey] === "undefined" ? 0 : iMap[mapKey]) + map[mapKey];
                    }
                }
            }
        }

        indexArr = Object.keys(iMap);

        if (indexArr.length === 0) {
            return -1;
        }
    }

    console.log(iMap);

    const index = indexArr.reduce((a, b) => iMap[a] > iMap[b] ? a : b);

    return index === -1 ? -1 : arr[index].id;
}