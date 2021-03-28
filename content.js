var globalVar = {
    "id": chrome.runtime.id,
    "index": chrome.runtime.getURL("/index.html"),
    "indexjs": chrome.runtime.getURL("/index.js"),
    "indexcss": chrome.runtime.getURL("/index.css"),
    "testjs": chrome.runtime.getURL("/test.js"),
    "icons": chrome.runtime.getURL("/icons")
}

function change_image_src(document) {
    document.querySelectorAll("img.readmore_dic_extension").forEach((img) => {
        img.src = img.src.substr(0, 18) + globalVar.id + img.src.substr(21, );
        // console.log(img.src);
    })
}

function excecute(click) {
    let x = click.clientX;
    let y = click.clientY;

    const xhr = new XMLHttpRequest();

    //////////////
    ////remove the prev div if have any
    /////////////

    if (document.querySelector("body div#readmore_extension")) {
        document.querySelector("body div#readmore_extension").remove();
    }

    const container = document.createElement("div");
    container.id = "readmore_extension";
    container.setAttribute("style", `position:fixed;
                z-index:1000;
                top:${y}px;left:${x}px;
                display:grid;
                z-index: 1000;
                flex-direction: row;
                grid-template-columns: minmax(300px,500px)`)
    xhr.onload = function() {
        container.innerHTML += xhr.responseText;
        change_image_src(container);
        document.body.appendChild(container);

        var majorcomp = {
            template: document.querySelector("body div.dic-section template.box-container"),
            section: document.querySelector("body div.dic-section"),
            box: document.querySelector("body div.dic-section div.box"),
            pofspeech: document.querySelector("body div.dic-section  div.pofspeech"),
            definition: document.querySelector("body div.dic-section div.box div[id='definition']"),
            example: document.querySelector("body div.dic-section div.box div[id='example']"),
            audio: document.querySelector("body div.dic-wrapper div.dic-section div.feature img[id='volume']"),
            loading: document.getElementById("loading"),
            loadBall: document.querySelectorAll("body span[id='load_ball']"), // returns array
            theme_changer: document.querySelector("body div.dic-section div.feature div#theme-changer input#checkbox"),
        }

        fetch_ahead(majorcomp);

    };

    xhr.open("get", globalVar.index);
    xhr.send();
}

document.body.addEventListener("dblclick", ((click) => {

    chrome.storage.local.get("status", (res) => {
        if (res.status === "true") {
            console.log("excecuting");
            excecute(click);
        } else {
            console.log("status:off");
        }
    })

}), true);