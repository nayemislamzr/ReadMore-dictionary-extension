function createDOMelements() {
    return {
        mydic: {
            "audio": []
        },
        srch_word: '',
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

async function wow(majorcomp) {
    let t = 0,
        x = 0;
    const w = ((2 * Math.PI) * 0.25);
    var theta = [];

    majorcomp.loadBall.forEach((ball) => {
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
            majorcomp.loadBall.forEach((ball, index) => {
                var res = (25 * Math.sin(w * t + (Math.sinh(theta[index]) / 25) * (Math.PI / 180)));
                ball.style.top = `${res}px`;
            })
        })
        t++;
        i++;
        if (globalVariables.fetched || globalVariables.error) {
            break;
        }
    }
    if (i >= 60 || globalVariables.fetched || globalVariables.error) {
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
        majorcomp.loading.appendChild(notfound);
        globalVariables.error = false;
        globalVariables.fetched = false;
    }
}

async function fetching(input) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${input}`);
        let file = await response.json();
        console.log("Data has been fetched successfully");
        return file;
    } catch (error) {
        console.error("Error occured during data was fetching..try again!!!");
        globalVariables.error = true;
        return error;
    }
}

function get_items(file, mydic) {
    for (let obj of file) {
        for (let meaning of obj["meanings"]) {
            let partofspeech = meaning['partOfSpeech'];
            if (!(partofspeech in mydic)) {
                mydic[partofspeech] = new Object({
                    "definition": [],
                    "example": [],
                    "synonym": []
                })
            }
            for (let def of meaning["definitions"]) {
                if ('definition' in def) mydic[partofspeech]["definition"].push(def['definition']);
                if ('example' in def) mydic[partofspeech]["example"].push(def['example']);
                if ('synonyms' in def) {
                    for (let synonym of def['synonyms']) {
                        mydic[partofspeech]['synonym'].push(synonym);
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

    chrome.storage.local.set({ "cache": { "test": mydic } });
}

const delete_prev_item = function() {
    document.querySelectorAll("div.box").forEach((box) => {
        box.remove();
    })
}

function show_items(mydic, DOMelements, majorcomp) {

    /////////////
    ////show word
    ////////////

    document.querySelector("body div.dic-wrapper div.head-sec span[id='src_word']").innerHTML = `<q>${DOMelements.srch_word}</q>`;

    let ul = document.createElement("ul");

    for (let key in mydic) {
        if (key != "audio") {
            (() => {

                let template = majorcomp.template;
                let node = document.importNode(template.content, true);

                node["children"][0].id = key.toLowerCase();
                let pofspeech_list = document.createElement("li");
                pofspeech_list.innerText = key;
                ul.appendChild(pofspeech_list);

                mydic[key]["definition"].forEach(def => {
                    let span = document.createElement("div");
                    span.innerText = def;
                    span.style.display = "list-item";
                    span.style.marginLeft = "10px";
                    span.style.lineHeight = "1.4";
                    node.children[0].children[0].children[0].children[1].appendChild(span);
                })

                mydic[key]["example"].forEach(example => {
                    let span = document.createElement("div");
                    span.innerText = example;
                    span.style.display = "list-item";
                    span.style.marginLeft = "10px";
                    span.style.lineHeight = "1.4";
                    node.children[0].children[1].children[0].children[1].appendChild(span);
                })

                if (mydic[key]["example"].length === 0) {
                    node.children[0].children[1].children[0].remove();
                }

                if (mydic[key]["definition"].length === 0) {
                    node.children[0].children[0].children[0].remove();
                }

                majorcomp.section.appendChild(node);
            })();
        }
    }

    if (majorcomp.pofspeech.children.length) {
        majorcomp.pofspeech.children[0].replaceWith(ul);
    } else {
        majorcomp.pofspeech.appendChild(ul);
    }
}

function dom_items(majorcomp) {
    majorcomp.section.children[3].style.display = "block";

    let clickedArray = [];
    //  clickedArray.push(majorcomp.pofspeech.children[0].children[0].innerText.toLowerCase());
    clickedArray.push(majorcomp.pofspeech.children[0].children[0]);

    majorcomp.pofspeech.children[0].addEventListener("click", (e) => {
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



    majorcomp.section.querySelectorAll(("div.object"), 'before').forEach((e) => e.addEventListener("click", () => {
        e.setAttribute("style", "max-height:100%;")
    }), false)


    majorcomp.audio.addEventListener("click", () => {
        let audio = new Audio(globalVariables.audio_src);
        audio.play();
    }, false)

    /////////
    /////theme changer
    ////////

    let themeStatus = majorcomp.theme_changer.checked;

    majorcomp.theme_changer.addEventListener("change", () => {
        themeStatus = !themeStatus;
        if (themeStatus) {
            chrome.storage.local.set({ "theme": "dark" });
            document.documentElement.setAttribute("theme", "redPink-dark");
        } else {
            chrome.storage.local.set({ "theme": "light" });
            document.documentElement.setAttribute("theme", "light-theme");
        }
    }, false)

    ///////
    ///check for off focus
    //////

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

function select_theme(majorcomp) {
    chrome.storage.local.get("theme", (response) => {
        switch (response.theme) {
            case "dark":
                {
                    document.documentElement.setAttribute("theme", "redPink-dark");
                    majorcomp.theme_changer.checked = "true";
                    break;
                }
            case "light":
                {
                    document.documentElement.setAttribute("theme", "light-theme");
                    majorcomp.theme_changer.checked = "false";
                    break;
                }
            default:
                {
                    document.documentElement.setAttribute("theme", "redPink-dark");
                    majorcomp.theme_changer.checked = "true";
                }
        }
    })
}

function appearance(majorcomp) {
    select_theme(majorcomp);
}

async function fetch_ahead(majorcomp) {
    console.log("starting fetching data");

    appearance(majorcomp);

    if (majorcomp.loading.children.length === 2)
        majorcomp.loading.children[1].remove();
    majorcomp.loading.style.display = "block";

    let input = document.getSelection().toString();
    console.log(input);
    wow(majorcomp);
    await fetching(input)
        .then((response) => {
            let file = response;
            let DOMelements = createDOMelements();
            DOMelements.srch_word = file[0]["word"];
            globalVariables.fetched = true;
            majorcomp.loading.style.display = "none";
            let mydic = DOMelements.mydic;
            get_items(file, mydic, majorcomp); // getting data from json format
            console.log("Data has been parsed Successfully");
            delete_prev_item(); // will delete previous shown results if have any
            show_items(mydic, DOMelements, majorcomp); // showing in html
            globalVariables.audio_src = mydic["audio"][0];
            dom_items(majorcomp);
        })
        .catch(() => {
            console.log("Error occured during parsing data!!! or showing DOM items");
            globalVariables.error = true;
        })

    console.log("Executed Successfully...");
}