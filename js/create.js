const quoteInput = document.getElementById("quote-input");
const quoteList = document.getElementById("quote-list");
const quoteSelect = document.getElementById("quote-select");
const quoteOutput = document.getElementById("quote");

const realAuthorInput = document.getElementById("real-author-input");
const realAuthorList = document.getElementById("real-author-list");
const realAuthorSelect = document.getElementById("real-author-select");
const realAuthorOutput = document.getElementById("real-author");

const fakeAuthorInput = document.getElementById("fake-author-input");
const fakeAuthorList = document.getElementById("fake-author-list");
const fakeAuthorSelect = document.getElementById("fake-author-select");
const fakeAuthorOutput = document.getElementById("fake-author");

const submitButton = document.getElementById("submit-button");

const currentSelection = {};

function runCode() {
    addOptionsToDatalists();

    quoteInput.onkeyup = () => {
        onInputChange(quoteInput, quoteSelect, getAllQuoteObjects, "quote");
    }
    realAuthorInput.onkeyup = () => {
        onInputChange(realAuthorInput, realAuthorSelect, getAllAuthorObjects, "author");
    }
    fakeAuthorInput.onkeyup = () => {
        onInputChange(fakeAuthorInput, fakeAuthorSelect, getAllAuthorObjects, "author");
    }
    quoteInput.onchange = () => {
        onInputChange(quoteInput, quoteSelect, getAllQuoteObjects, "quote");
    }
    realAuthorInput.onchange = () => {
        onInputChange(realAuthorInput, realAuthorSelect, getAllAuthorObjects, "author");
    }
    fakeAuthorInput.onchange = () => {
        onInputChange(fakeAuthorInput, fakeAuthorSelect, getAllAuthorObjects, "author");
    }

    quoteSelect.onchange = () => {
        onSelectChange(quoteSelect, quoteOutput, getQuoteById, "quote", "q");
    }
    realAuthorSelect.onchange = () => {
        onSelectChange(realAuthorSelect, realAuthorOutput, getAuthorById, "author", "ra");
    }
    fakeAuthorSelect.onchange = () => {
        onSelectChange(fakeAuthorSelect, fakeAuthorOutput, getAuthorById, "author", "fa");
    }

    submitButton.onclick = () => {
        if (!currentSelection.q) {
            alert("Du musst ein Zitat auswählen.");
            return;
        }
        if (!currentSelection.fa) {
            alert("Du musst einen falschen Autor auswählen.");
            return;
        }
        if (!currentSelection.q.id && !currentSelection.ra) {
            alert("Du musst einen richtigen Autor auswählen.");
            return;
        }
        if (currentSelection.q.id && currentSelection.fa.id) {
            openUrl(getUrlWithId(currentSelection.q.id + "-" + currentSelection.fa.id));
            return;
        }

        const ids = []; //[quoteId, authorId]
        const promises = [];

        if (currentSelection.q.id) {
            ids[0] = currentSelection.q.id;
        } else {
            const options = {quote: currentSelection.q.quote};
            if (currentSelection.ra.id) {
                options.author = currentSelection.ra.id;
                promises.push(createQuoteRequest(ids, options));
            } else {
                promises.push(new Promise(resolve => createRequest("authors", {author: currentSelection.ra.author}).then(realAuthor => {
                    options.author = realAuthor.id;
                    createQuoteRequest(ids, options).then(() => resolve());
                })));
            }
        }
        if (currentSelection.fa.id) {
            ids[1] = currentSelection.fa.id;
        } else {
            promises.push(createRequest("authors", {author: currentSelection.fa.author}).then(fakeAuthor => ids[1] = fakeAuthor.id));
        }

        console.log(promises);
        Promise.all(promises).then(() => {
            saveToLocalStorage();
            openUrl(getUrlWithId(ids[0] + "-" + ids[1]));
        });
    }
}

function addOptionsToDatalists() {
    quoteList.innerHTML = "";
    realAuthorList.innerHTML = "";
    fakeAuthorList.innerHTML = "";

    for (const quote of getAllQuoteObjects()) {
        quoteList.appendChild(createDatalistOptionElement(quote.quote));
    }
    for (const author of getAllAuthorObjects()) {
        realAuthorList.appendChild(createDatalistOptionElement(author.author));
        fakeAuthorList.appendChild(createDatalistOptionElement(author.author));
    }
}

function createQuoteRequest(ids, options) {
    return createRequest( "quotes", options).then(quote => ids[0] = quote.id);
}

function createRequest(endpoint, options) {
    return new Promise(resolve => {
        $.post(quotesApi + endpoint, options, data => {
            handleQuoteApiData(data);
            resolve(data);
        }, "json");
    });
}

function onInputChange(input, select, funToGetAllObjs, keyToSet) {
    const inputVal = input.value.trim();

    const options = [];

    const allObjects = funToGetAllObjs();

    // if the input is exactly in the list
    for (const obj of allObjects) {
        if (obj[keyToSet] === inputVal) {
            options.push(createOptionFromObj(obj, keyToSet));
            replaceOptionsSelect(select, options);
            select.onchange();
            return;
        }
    }

    const exactSearchResult = search(inputVal, allObjects, keyToSet, true);
    if (exactSearchResult.length > 0) {
        const resultText = exactSearchResult[0][keyToSet];
        options.push(createOption(resultText, exactSearchResult[0].id));
    }

    const searchResult = search(inputVal, allObjects, keyToSet);
    for (const obj of searchResult) {
        options.push(createOptionFromObj(obj,keyToSet));
    }

    const lunrResults = lunrSearch(inputVal, keyToSet);
    for (const obj of lunrResults) {
        options.push(createOptionFromObj(obj,keyToSet));
    }

    options.push(createInputOption(inputVal));
    const fixedInputVal = fixInput(inputVal);
    if (fixedInputVal !== inputVal) {
        options.push(createInputOption(fixedInputVal));
    }

    //remove duplicate options:
    const options2 = [];
    for (const option of options) {
        let isIn2 = false;
        for (const o2 of options2) {
            if (o2.text === option.text) {
                isIn2 = true;
                break;
            }
        }
        if (!isIn2) {
            options2.push(option);
        }
    }

    if (exactSearchResult.length === 0 && options2.length > 1) {
        //means no selection, add it in beginning
        options2.unshift(createOption("- - - -", -1));
    }

    replaceOptionsSelect(select, options2);
    select.onchange();
}


function onSelectChange(select, output, funToGetObjById, keyToSet, selectKey) {
    if (select.value === -1 || select.value === "-1") {
        delete currentSelection[selectKey];
        showOutput();
        return;
    }
    let selectedObj = funToGetObjById(select.value);
    if (!selectedObj) {
        selectedObj = {};
        selectedObj[keyToSet] = decodeURIComponent(select.value);
    }
    currentSelection[selectKey] = selectedObj;

    showOutput();
}

function showOutput() {
    const realAuthorDisabled = currentSelection.q && currentSelection.q.id;
    realAuthorInput.disabled = realAuthorDisabled;
    realAuthorSelect.disabled = realAuthorDisabled;

    displayOutput(quoteOutput, currentSelection.q, "quote", "»%s«");
    displayOutput(realAuthorOutput,
        realAuthorDisabled ? currentSelection.q.author : currentSelection.ra,
        "author", " - %s");
    displayOutput(fakeAuthorOutput, currentSelection.fa, "author", "- %s");
}

function displayOutput(output, obj, key, basis) {
    if (obj) {
        output.innerHTML = basis.replace("%s", obj[key]) + (obj.id ? " (" + obj.id + ")" : "");
    } else {
        output.innerHTML = "";
    }
}

function createOptionFromObj(obj, textKey) {
    return {text: obj[textKey], value: obj.id};
}

function createOption(pText, pValue) {
    return {text: pText, value: pValue};
}

function createInputOption(inputVal) {
    return createOption(inputVal, encodeURIComponent(inputVal));
}

function fixInput(inputVal) {
    /* TODO:
        - Add dot in end if missing and quote
          Make first char uppercase
        - remove quotation marks if in end and beginning
        - fix: "word ,word"
        - fix: "word  word"
        - fix: "word ."
        - spellchecking + auto correct
        - ...
     */
    return inputVal[0].toUpperCase() + inputVal.substring(1);
}


function replaceOptionsSelect(select, options) {
    // remove all options:
    select.innerHTML = "";

    if (options) {
        addOptionsSelect(select, options);
    }
}

function createDatalistOptionElement(text) {
    const el = document.createElement("option");
    el.text = text;
    return el;
}

function createOptionElement(option) {
    const oEl = document.createElement("option");
    oEl.text = option.text;
    oEl.value = option.value;
    return oEl;
}

function addOptionsSelect(select, options) {
    for (const option of options) {
        select.add(createOptionElement(option));
    }
}

const lunrIndexes = {quote:{},  author:{}};
function getLunrIndex(type) {
    let arr;
    if (type === "quote") {
        arr = getAllQuoteObjects();
    } else if (type === "author") {
        arr = getAllAuthorObjects();
    } else {
        console.error(`Invalid argument given. Type should be "quote" or "author" and not ${type}.`)
        return;
    }
    const arrLength = arr.length;
    let obj = lunrIndexes[type];
    if (obj[arr.length]) {
        return obj[arrLength];
    }

    obj = {};
    obj[arrLength] = lunr(function () {
        this.use(lunr.de);
        this.ref("id");
        this.field(type);

        for (const doc of arr) {
            this.add(doc);
        }
    })
    lunrIndexes[type] = obj;
    return obj[arrLength];
}

const lunrMaxCount = 4;
function lunrSearch(searchTerm, type) {
    const idx = getLunrIndex(type);
    // replacement allows 1 edit; see: https://lunrjs.com/guides/searching.html
    const result = idx.search((searchTerm + " ").replaceAll(/(\w+)[^\w~]/g, "$1~1 "));

    const funToGetObjById = type === "quote" ? getQuoteById : getAuthorById;
    const arrToReturn = [];
    let count = 0;
    for (const el of result) {
        if (el.score < 3.141 || count++ >= lunrMaxCount) break;
        arrToReturn.push(funToGetObjById(el.ref));
    }
    return arrToReturn;
}

loadFiles();
