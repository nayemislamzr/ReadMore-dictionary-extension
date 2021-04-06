function createDOMelements() {
    return {
        mydic: {
            "meanings": {

            },
            "audio": [],
            "word": '',
        }
    }
}

var globalVariables = {
    fetched: false,
    error: false,
    audio_src: ''
}

function loading(t) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(t);
        }, 100);
    });
}

async function loading_screen() {
    let t = 0,
        x = 0;
    const w = ((2 * Math.PI) * 0.25);
    var theta = [];

    componants.loadBall.forEach((ball) => {
        x %= 4;
        let th = (25 * Math.sin(w * x));
        if (th > -1)
            theta.push(Math.ceil(th));
        else theta.push(Math.floor(th));
        x++;
    })
    let i = 0;
    while (i < 60) {
        t %= 4;
        let a = await loading(t).then((t) => {
            componants.loadBall.forEach((ball, index) => {
                var res = (25 * Math.sin(w * t + (Math.sinh(theta[index]) / 25) * (Math.PI / 180)));
                ball.style.top = `${res}px`;
            })
        })
        t++;
        i++;
        if (globalVariables.fetched || globalVariables.error) {
            globalVariables.fetched = false;
            break;
        }
    }
    if (i >= 60 || globalVariables.error) {
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
        componants.loading.appendChild(notfound);
        globalVariables.error = false;
        globalVariables.fetched = false;

        off_focus();

    }
}

async function fetching(input) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${input}`);
        let file = await response.json();
        console.log("Data has been fetched successfully");
        globalVariables.fetched = true;
        componants.loading.style.display = "none";
        return file;
    } catch (error) {
        console.error("Error occured during data was fetching..try again!!!");
        globalVariables.error = true;
        return error;
    }
}

function get_items(file, mydic) {

    mydic.word = file[0]["word"];

    for (let obj of file) {
        for (let meaning of obj["meanings"]) {
            let partofspeech = meaning['partOfSpeech'];
            if (!(partofspeech in mydic.meanings)) {
                mydic.meanings[partofspeech] = new Object({
                    "definition": [],
                    "example": [],
                    "synonym": []
                })
            }
            for (let def of meaning["definitions"]) {
                if ('definition' in def) mydic.meanings[partofspeech]["definition"].push(def['definition']);
                if ('example' in def) mydic.meanings[partofspeech]["example"].push(def['example']);
                if ('synonyms' in def) {
                    for (let synonym of def['synonyms']) {
                        mydic.meanings[partofspeech]['synonym'].push(synonym);
                    }
                }
            }
        }
    }

    for (let obj of file) {
        for (let phonetic of obj['phonetics']) {
            // console.log(phonetic['text']);
            mydic['audio'].push(phonetic['audio']);
        }
    }

    let obj = {};
    obj[mydic.word] = mydic;
    console.log(obj);
    chrome.storage.local.set(obj);
}

const delete_prev_item = function() {
    document.querySelectorAll("div.box").forEach((box) => {
        box.remove();
    })
}

function show_items(mydic) {

    /////////////
    ////show word
    ////////////

    document.querySelector("body div.dic-wrapper div.head-sec span[id='src_word']").innerHTML = `<q>${mydic.word}</q>`;
    globalVariables.audio_src = mydic["audio"][0];

    let ul = document.createElement("ul");

    for (let key in mydic.meanings) {

        let template = componants.template;
        let node = document.importNode(template.content, true);

        node["children"][0].id = key.toLowerCase();
        let pofspeech_list = document.createElement("li");
        pofspeech_list.innerText = key;
        ul.appendChild(pofspeech_list);

        mydic.meanings[key]["definition"].forEach(def => {
            let textResult = document.createElement("div");
            textResult.innerText = def;
            textResult.class = "readmore-extension-text-area";
            node.children[0].children[0].children[0].children[1].appendChild(textResult);
        });

        mydic.meanings[key]["example"].forEach(example => {
            let textResult = document.createElement("div");
            textResult.innerText = example;
            textResult.class = "readmore-extension-text-area";
            node.children[0].children[1].children[0].children[1].appendChild(textResult);
        });

        if (mydic.meanings[key]["example"].length === 0) {
            node.children[0].children[1].children[0].remove();
        }

        if (mydic.meanings[key]["definition"].length === 0) {
            node.children[0].children[0].children[0].remove();
        }

        componants.section.appendChild(node);
    }

    componants.pofspeech.appendChild(ul);
}

function dom_items() {
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
        let audio = new Audio(globalVariables.audio_src);
        audio.play();
    }, false)

    /////////
    /////theme changer
    ////////

    let themeStatus = componants.theme_changer.checked;

    componants.theme_changer.addEventListener("change", () => {
        themeStatus = !themeStatus;
        if (themeStatus) {
            chrome.storage.local.set({ "theme": "dark" });
            document.documentElement.setAttribute("theme", "redPink-dark");
        } else {
            chrome.storage.local.set({ "theme": "light" });
            document.documentElement.setAttribute("theme", "redPink-light");
        }
    }, false)

    ///////
    ///check for off focus
    //////

    off_focus();
}

function off_focus() {
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

function remove_error_msg() {
    if (componants.loading.children.length === 2)
        componants.loading.children[1].remove();
    componants.loading.style.display = "block";
}

function select_theme() {
    chrome.storage.local.get("theme", (response) => {
        switch (response.theme) {
            case "dark":
                {
                    document.documentElement.setAttribute("theme", "redPink-dark");
                    componants.theme_changer.checked = "true";
                    break;
                }
            case "light":
                {
                    document.documentElement.setAttribute("theme", "redPink-light");
                    componants.theme_changer.checked = "false";
                    break;
                }
            default:
                {
                    document.documentElement.setAttribute("theme", "redPink-dark");
                    componants.theme_changer.checked = "true";
                }
        }
    })
}

function appearance() {
    remove_error_msg();
    select_theme();
}

async function fetch_ahead(majorcomp) {
    console.log("starting fetching data");
    globalThis.componants = majorcomp;
    appearance();

    var word = document.getSelection().toString(); // get the selected text
    console.log(word);

    loading_screen(); // load screen

    // chrome.storage.local.get(word,(response)=>{
    //     if(response.)
    // })

    await fetching(word)
        .then((response) => {
            let file = response;

            let DOMelements = createDOMelements();
            let mydic = DOMelements.mydic;

            get_items(file, mydic); // getting data from json format
            console.log("Data has been parsed Successfully");
            delete_prev_item(); // will delete previous shown results if have any
            show_items(mydic); // showing in html
            dom_items();
        })
        .catch(() => {
            console.log("Error occured during parsing data!!! or showing DOM items");
            globalVariables.error = true;
        })

    console.log("Executed Successfully...");

};