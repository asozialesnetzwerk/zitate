const quoteInput = document.getElementById("quote-input");
const quoteSelect = document.getElementById("quote-select");

const realAuthorInput = document.getElementById("real-author-input");
const realAuthorSelect = document.getElementById("real-author-select");

const fakeAuthorInput = document.getElementById("fake-author-input");
const fakeAuthorSelect = document.getElementById("fake-author-select");

function runCode() {
    quoteInput.onchange = () => {
        onchange(quoteInput, quoteSelect, getAllQuoteObjects, "quote");
    }

    fakeAuthorInput.onchange = () => {
        onchange(fakeAuthorInput, fakeAuthorSelect, getAllAuthorObjects, "author");
    }

    realAuthorInput.onchange = () => {
        onchange(realAuthorInput, realAuthorSelect, getAllAuthorObjects, "author");
    }
}

function onchange(input, select, funToGetObj, keyToSet) {
    const inputVal = input.value.trim();

    const options = [];

    const searchResult = search(inputVal, funToGetObj(), keyToSet);
    for (const obj of searchResult) {
        options.push(createOption(obj[keyToSet], obj.id));
    }

    options.push(createInputOption(inputVal));
    const fixedInputVal = fixInput(inputVal);
    if (fixedInputVal !== inputVal) {
        options.push(createInputOption(fixedInputVal));
    }

    replaceOptionsSelect(select, options);

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

    // add new options:
    for (const option of options) {
        const oEl = document.createElement("option");
        oEl.text = option.text;
        oEl.value = option.value;
        select.add(oEl);
    }

    select.selected = 0;
}

loadFiles();
