function getComponants() {
    return {
        template: document.querySelector("body div.dic-section template.box-container"),
        section: document.querySelector("body div.dic-section"),
        box: document.querySelector("body div.dic-section div.box"),
        pofspeech: document.querySelector("body div.dic-section  div.pofspeech"),
        definition: document.querySelector("body div.dic-section div.box div[id='definition']"),
        example: document.querySelector("body div.dic-section div.box div[id='example']"),
        audio: document.querySelector("body div.dic-wrapper div.dic-section div.feature div[id='volume']"),
        loadingSection: document.querySelector("body div.dic-loading-section"),
        theme_changer: document.querySelector("body div.dic-section div.feature div#theme-changer input#checkbox"),
    }
}

const defaultConfig = {
    "allow-site": "all",
    "cache": false,
    "themes": "light",
    "cache-value": 0,
}


function createDictionaryElement() {
    return {
        wordInDictionary: {
            "meanings": {

            },
            "audio": [],
            "word": '',
        }
    }
}

var fetchVariables = {
    fetched: false,
    error: false,
    audio_src: '',
    src_word: '',
}

function getSelectedWord() {
    word = window.getSelection().toString().toLowerCase();
    fetchVariables.src_word = word;
    return word;
};

function getPreference() {
    const preference = new Promise((resolve) => {
        chrome.storage.local.get("preference", response => {
            if ("preference" in response) {
                resolve(response.preference);
            } else {
                resolve({});
            }
        })
    })
    return preference;
}

function mergePreference(selectedConfig) { // merges both default and the selected preference

    let preference = {
        ...defaultConfig,
        ...selectedConfig
    }

    // console.log(preference);
    return preference;
}

function loading(t) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(++t);
        }, 100);
    });
}

function showErrorMessage() {
    let errorScreenWrapper = document.createElement("div");
    errorScreenWrapper.id = "errorWrapper";
    let notfound = document.createElement("div");
    notfound.id = "not-found-wrapper";
    let notfoundImage = document.createElement("img");
    notfoundImage.src = chrome.runtime.getURL("/icons/black/404-error.svg");
    notfoundImage.id = "notfound";
    notfound.appendChild(notfoundImage);
    let msg = document.createElement("div");
    msg.innerText = "Not Found";
    msg.id = "notfoundmessage";
    notfound.appendChild(msg);
    errorScreenWrapper.appendChild(notfound);
    componants.loadingSection.appendChild(errorScreenWrapper);
    fetchVariables.error = false;
    fetchVariables.fetched = false;
}

async function loadingScreen() {

    const timeOut = 60;
    var timeSpent = 0;

    while (timeSpent < timeOut) {

        await loading(timeSpent).then((t) => {
            timeSpent = t;
        })

        if (fetchVariables.fetched || fetchVariables.error) {
            fetchVariables.fetched = false;
            break;
        }
    }
    if (timeSpent >= 60 || fetchVariables.error) {

        // console.log("problem occured");

        showErrorMessage();

        offFocus();
    }
}

function createNewDictionay() {
    let object = new Promise((resolve) => {
        chrome.storage.local.set({ dictionary: {} });
        resolve();
    })
    return object;
}

function getDictionary() {
    let object = new Promise((resolve) => {
        chrome.storage.local.get("dictionary", (response) => {
            if (!("dictionary" in response)) {
                console.log("creating new dictionary")
                createNewDictionay()
                    .then(() => {
                        console.log("created new dictionary");
                        resolve({});
                    })
                    .catch(() => {
                        console.log("error occured while creating new dictionary")
                    })
            } else {
                let copy_dictionary = response.dictionary;
                resolve(copy_dictionary);
            }
        })
    })
    return object;
}

function formateDictionay(file, wordInDictionary) {

    wordInDictionary.word = file[0]["word"];

    for (let obj of file) {
        for (let meaning of obj["meanings"]) {
            let partofspeech = meaning['partOfSpeech'];
            if (!(partofspeech in wordInDictionary.meanings)) {
                wordInDictionary.meanings[partofspeech] = new Object({
                    "definition": [],
                    "example": [],
                    "synonym": []
                })
            }
            for (let def of meaning["definitions"]) {
                if ('definition' in def) wordInDictionary.meanings[partofspeech]["definition"].push(def['definition']);
                if ('example' in def) wordInDictionary.meanings[partofspeech]["example"].push(def['example']);
                if ('synonyms' in def) {
                    for (let synonym of def['synonyms']) {
                        wordInDictionary.meanings[partofspeech]['synonym'].push(synonym);
                    }
                }
            }
        }
    }

    for (let obj of file) {
        for (let phonetic of obj['phonetics']) {
            // console.log(phonetic['text']);
            wordInDictionary['audio'].push(phonetic['audio']);
        }
    }
}

function showResult(wordInDictionary) {

    /////////////
    ////show word
    ////////////

    document.querySelector("body div.dic-wrapper div.head-sec span[id='src_word']").innerHTML = `<q>${wordInDictionary.word}</q>`;
    fetchVariables.audio_src = wordInDictionary["audio"][0];

    let ul = document.createElement("ul");

    for (let key in wordInDictionary.meanings) {

        let template = componants.template;
        let node = document.importNode(template.content, true);
        const definitions = wordInDictionary.meanings[key]["definition"];
        const examples = wordInDictionary.meanings[key]["example"];

        const definitionSection = node.children[0].children[0].children[0].children[1];
        const exampleSection = node.children[0].children[1].children[0].children[1];

        node["children"][0].id = key.toLowerCase();
        let pofspeech_list = document.createElement("li");
        pofspeech_list.innerText = key;
        ul.appendChild(pofspeech_list);

        definitions.forEach(def => {
            let textResult = document.createElement("div");
            textResult.innerText = def;
            textResult.className = "readmore-extension-text-area";
            definitionSection.appendChild(textResult);
        });

        examples.forEach(example => {
            let textResult = document.createElement("div");
            textResult.innerText = example;
            textResult.className = "readmore-extension-text-area";
            exampleSection.appendChild(textResult);
        });

        if (examples.length === 0) {
            node.children[0].children[1].children[0].remove(); // removing example box
        }

        if (definitions.length === 0) {
            node.children[0].children[0].children[0].remove(); // removing definition box
        }

        componants.section.appendChild(node);
    }

    componants.pofspeech.appendChild(ul);
}

function eventListener() {
    componants.section.children[3].style.display = "block";

    let clickedArray = [];
    //  clickedArray.push(componants.pofspeech.children[0].children[0].innerText.toLowerCase());
    clickedArray.push(componants.pofspeech.children[0].children[0]);

    componants.pofspeech.children[0].addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            let topItem = clickedArray.pop();
            topItem.setAttribute("style", "border:1px solid transparent;");
            document.getElementById(topItem.innerText.toLowerCase()).setAttribute("style", "display:none;")
            e.target.setAttribute("style", "border: 2px solid rgb(200, 198, 204);background-color:rgb(164, 166, 170)");
            let clickedItem = e.target;
            clickedArray.push(clickedItem);
            document.getElementById(clickedItem.innerText.toLowerCase()).setAttribute("style", "display:block;")
        }
    }, false)



    componants.section.querySelectorAll(("div.object"), 'before').forEach((e) => e.addEventListener("click", () => {
        e.setAttribute("style", "max-height:100%;")
    }), false)


    componants.audio.addEventListener("click", () => {
        let audio = new Audio(fetchVariables.audio_src);
        audio.play();
    }, false)

    /////////
    /////theme changer
    ////////


    componants.theme_changer.addEventListener("change", () => {

        let themeStatus = componants.theme_changer.checked;

        if (themeStatus) {
            document.documentElement.setAttribute("theme", "redPink-dark");
            var currentTheme = "dark";
        } else {
            document.documentElement.setAttribute("theme", "redPink-light");
            var currentTheme = "light";
        }

        getPreference()
            .then((oldPreference) => {
                oldPreference.themes = currentTheme;
                chrome.storage.local.set({ preference: oldPreference });
            });
    }, false)

    ///////
    ///check for off focus
    //////

    offFocus();
}

function offFocus() {
    document.body.addEventListener("click", ((click) => {
        try {
            if (!(document.querySelector("body div#readmore_extension").contains(click.target))) {
                document.querySelector("body div#readmore_extension").remove();
            }
        } catch {
            // as clicked item can be empty(none)   
        }
    }))
}

function selectTheme(theme) {

    // console.log(theme);

    switch (theme) {
        case "dark":
            {
                // console.log("dark");
                document.documentElement.setAttribute("theme", "redPink-dark");
                componants.theme_changer.checked = true;
                break;
            }
        case "light":
            {
                // console.log("light")
                document.documentElement.setAttribute("theme", "redPink-light");
                componants.theme_changer.checked = false;
                break;
            }
        default:
            {
                // console.log("default")
                document.documentElement.setAttribute("theme", "redPink-dark");
                componants.theme_changer.checked = true;
            }
    }
}

function prepareExtensionScreen() {
    fetchVariables.fetched = true;
    componants.loadingSection.style.display = "none";
    componants.section.style.display = "block";
}

function doFetch(word) {

    let fetchPromise = new Promise((resolve) => {
        console.log("fetching");
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`HTTP Status : ${response.status}`);
                }
            })
            .then((jsonFile) => {
                console.log("fetched");
                let file = jsonFile;
                let DOMelements = createDictionaryElement();
                let wordInDictionary = DOMelements.wordInDictionary;
                formateDictionay(file, wordInDictionary); // getting data from json format
                console.log("Data has been parsed Successfully");
                resolve(wordInDictionary);
            })
            .catch((error) => {
                fetchVariables.error = true;
                console.error(error); // 404 errors
            })
    })

    return fetchPromise;

}

function executeSelectedWord(word) {

    return new Promise((resolve) => {
        getDictionary()
            .then(async(copy_dictionary) => {
                if (word in copy_dictionary) {
                    console.log("from cache")
                    var wordInDictionary = copy_dictionary[word];
                } else {
                    console.log("from fetch");
                    var wordInDictionary = await doFetch(word);
                    if (cacheStatus) {
                        cacheWord(word, wordInDictionary);
                    }
                }
                resolve(wordInDictionary);
            })
    })

}

function excecuteExtension(wordInDictionary) {

    if (wordInDictionary != "undefined") {
        prepareExtensionScreen();
        showResult(wordInDictionary); // showing in html
        eventListener();
    } else {
        prepareExtensionScreen();
        fetchVariables.error = true;
    }

}

function cacheWord(selected_text, word_obj) {
    // console.log("Caching");
    getDictionary()
        .then((copy_dictionary) => {
            // console.log(copy_dictionary);
            // console.log("got dictionary");
            copy_dictionary[selected_text] = word_obj;
            chrome.storage.local.set({ dictionary: copy_dictionary });
        })
        .catch(() => {
            console.log("error while setting cache");
        })
};

async function fetch_ahead() {
    console.log("starting fetching data");
    componants = getComponants();

    var mergedPreference = getPreference().then(mergePreference);

    mergedPreference.then(preference => selectTheme(preference.themes));
    mergedPreference.then((preference) => { globalThis.cacheStatus = preference.cache })

    var selectedWord = getSelectedWord(); // get the selected text
    loadingScreen(); // load screen

    var wordInDictionary = await executeSelectedWord(selectedWord);

    excecuteExtension(wordInDictionary);

    console.log("Executed Successfully...");
};