const quoteInput = document.getElementById("quote-input");
const quoteList = document.getElementById("quote-list");
const quoteOutput = document.getElementById("quote");

const realAuthorInput = document.getElementById("real-author-input");
const realAuthorList = document.getElementById("real-author-list");
const realAuthorOutput = document.getElementById("real-author");

const fakeAuthorInput = document.getElementById("fake-author-input");
const fakeAuthorList = document.getElementById("fake-author-list");
const fakeAuthorOutput = document.getElementById("fake-author");

const submitButton = document.getElementById("submit-button");

const currentSelection = {};

function runCode() {
    quoteInput.onkeyup = () => {
        updateDatalistStyle(quoteList, quoteInput);
        quoteList.style.display = "block";
        onInput(quoteInput, quoteList, getAllQuoteObjects, "quote", "q");
    }
    quoteInput.onchange = () => {
        quoteList.style.display = "none";
        onInput(quoteInput, quoteList, getAllQuoteObjects, "quote", "q");
    }

    realAuthorInput.onkeyup = () => {
        updateDatalistStyle(realAuthorList, realAuthorInput);
        realAuthorList.style.display = "block";
        onInput(realAuthorInput, realAuthorList, getAllAuthorObjects, "author", "ra");
    }
    realAuthorInput.onchange = () => {
        realAuthorList.style.display = "none";
        onInput(realAuthorInput, realAuthorList, getAllAuthorObjects, "author", "ra");
    }

    fakeAuthorInput.onkeyup = () => {
        updateDatalistStyle(fakeAuthorList, fakeAuthorInput);
        fakeAuthorList.style.display = "block";
        onInput(fakeAuthorInput, fakeAuthorList, getAllAuthorObjects, "author", "fa");
    }
    fakeAuthorInput.onchange = () => {
        realAuthorList.style.display = "none";
        onInput(fakeAuthorInput, fakeAuthorList, getAllAuthorObjects, "author", "fa");
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

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
function updateDatalistStyle(datalist, input) {
    datalist.style.width = input.offsetWidth + 'px';
    datalist.style.left = input.offsetLeft + 'px';
    datalist.style.top = input.offsetTop + input.offsetHeight + 'px';
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

function getObjectByName(name, objects, key) {
    const nameLower = name.toLowerCase()
    for (const o of objects) {
        if (o[key].toLowerCase() === nameLower) return o;
    }
    const obj = {};
    obj[key] = name;
    return obj;
}

function onInput(input, dataList, funToGetAllObjs, keyToSet, selectionKey) {
    dataList.innerHTML = "";

    const inputVal = input.value.trim();

    if (inputVal.length === 0) {
        delete currentSelection[selectionKey];
        showOutput();
        return;
    }

    const allObjects = funToGetAllObjs();
    const inputObj = getObjectByName(inputVal, allObjects, keyToSet)
    currentSelection[selectionKey] = inputObj;
    showOutput();

    const options = [];

    if (inputObj.id !== -1) { // if the input is exactly in the list
        addOptionToDataList(dataList, inputVal);
        return;
    }

    if (inputVal.length > 1) { // only search if worth it:
        const almostExactSearchResult = search(inputVal, allObjects, keyToSet, true);
        if (almostExactSearchResult.length > 0) {
            options.push(almostExactSearchResult[0][keyToSet]);
        }

        const searchResult = search(inputVal, allObjects, keyToSet);
        for (const obj of searchResult) {
            options.push(obj[keyToSet]);
        }

        const lunrResults = lunrSearch(inputVal, keyToSet);
        for (const obj of lunrResults) {
            options.push(obj[keyToSet]);
        }
    }

    options.push(inputVal);
    options.push(fixInput(inputVal));

    // only add unique options
    const options2 = [];
    for (const option of options) {
        let isIn2 = false;
        for (const o2 of options2) {
            if (o2 === option) {
                isIn2 = true;
                break;
            }
        }
        if (!isIn2) {
            options2.push(option);
            // add options:
            addOptionToDataList(dataList);
        }
    }
}

function addOptionToDataList(dataList, optionText) {
    const option = document.createElement("OPTION");
    option.innerHTML = optionText;
    dataList.appendChild(option);
    console.log(optionText);
}

function showOutput() {
    const realAuthorDisabled = currentSelection.q && currentSelection.q.id;
    realAuthorInput.disabled = realAuthorDisabled;

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
