const quoteInput = document.getElementById("quote-input");
const quoteSelect = document.getElementById("quote-select");
const quoteOutput = document.getElementById("quote");

const realAuthorInput = document.getElementById("real-author-input");
const realAuthorSelect = document.getElementById("real-author-select");
const realAuthorOutput = document.getElementById("real-author");

const fakeAuthorInput = document.getElementById("fake-author-input");
const fakeAuthorSelect = document.getElementById("fake-author-select");
const fakeAuthorOutput = document.getElementById("fake-author");

const submitButton = document.getElementById("submit-button");

const currentSelection = {};

function runCode() {
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

    const exactSearchResult = search(inputVal, funToGetAllObjs(), keyToSet, true);
    if (exactSearchResult.length > 0) {
        const resultText = exactSearchResult[0][keyToSet];
        options.push(createOption(resultText, exactSearchResult[0].id));
    }

    const searchResult = search(inputVal, funToGetAllObjs(), keyToSet);

    for (const obj of searchResult) {
        options.push(createOption(obj[keyToSet], obj.id));
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
    displayOutput(quoteOutput, currentSelection.q, "quote", "»%s«");
    displayOutput(realAuthorOutput, getSelectedRealAuthor(), "author", " - %s");
    displayOutput(fakeAuthorOutput, currentSelection.fa, "author", "- %s");
}

function getSelectedRealAuthor() {
    if (currentSelection.q && currentSelection.q.id) {
        return currentSelection.q.author;
    } else {
        return currentSelection.ra;
    }
}

function displayOutput(output, obj, key, basis) {
    if (obj) {
        output.innerHTML = basis.replace("%s", obj[key]) + (obj.id ? " (" + obj.id + ")" : "");
    } else {
        output.innerHTML = "";
    }
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

function addOptionsSelect(select, options) {
    for (const option of options) {
        const oEl = document.createElement("option");
        oEl.text = option.text;
        oEl.value = option.value;
        select.add(oEl);
    }
}

loadFiles();
