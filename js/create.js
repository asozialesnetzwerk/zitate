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
}

function onInputChange(input, select, funToGetAllObjs, keyToSet) {
    const inputVal = input.value.trim();

    const options = [];

    const exactSearchResult = search(inputVal, funToGetAllObjs(), keyToSet, true);
    if (exactSearchResult.length > 0) {
        options.push(createOption(exactSearchResult[0][keyToSet], exactSearchResult[0].id));
    } else {
        const searchResult = search(inputVal, funToGetAllObjs(), keyToSet);

        //means no selection
        options.push(createOption("- - - -", -1));

        for (const obj of searchResult) {
            options.push(createOption(obj[keyToSet], obj.id));
        }

        options.push(createInputOption(inputVal));
        const fixedInputVal = fixInput(inputVal);
        if (fixedInputVal !== inputVal) {
            options.push(createInputOption(fixedInputVal));
        }
    }

    replaceOptionsSelect(select, options);
    select.selected = -1;
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

    if (currentSelection.q && currentSelection.q.id) {
        displayOutput(realAuthorOutput, currentSelection.q.author, "author", " - %s");
    } else {
        displayOutput(realAuthorOutput, currentSelection.ra, "author", " - %s")
    }

    displayOutput(fakeAuthorOutput, currentSelection.fa, "author", "- %s");
}

function displayOutput(output, obj, key, basis) {
    if (obj) {
        output.innerHTML = basis.replace("%s", obj[key]);
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
        - Add dot in end if missing
        - Make first char uppercase
        - remove quotation marks if in end and beginning
        - fix: "word ,word"
        - fix: "word  word"
        - fix: "word ."
        - ...
        - ...
     */
    return inputVal;
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
