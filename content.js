var resourceVariable = {
    "id": chrome.runtime.id,
    "index": chrome.runtime.getURL("/index.html"),
    "indexjs": chrome.runtime.getURL("/index.js"),
    "indexcss": chrome.runtime.getURL("/index.css"),
    "testjs": chrome.runtime.getURL("/test.js"),
    "icons": chrome.runtime.getURL("/icons"),
    "extensionBody": document.querySelector("body div#readmore_extension"),
}

cursorPosition = (click) => ({ x: click.pageX, y: click.pageY }); // gets proper cursor position
deletePreviousElement = (element) => { if (element != null) { element.remove() } }; // deletes previously box if have any

createExtensionFrame = (cursor) => { // html + css dynamically 
    const container = document.createElement("div");
    container.id = "readmore_extension";
    container.setAttribute("style", `position:absolute;
                z-index:1000;
                top:${cursor.y}px;left:${cursor.x}px;
                display:grid;
                z-index: 1000;
                flex-direction: row;
                grid-template-columns: minmax(300px,500px)`)
    return container;
}

const fonts = `<style>
@font-face {
    src: url('chrome-extension://${resourceVariable.id}/fonts/Montserrat-Light.ttf');
    font-family: Montserrat-Light;
}
@font-face {
    src: url('chrome-extension://${resourceVariable.id}/fonts/Ubuntu-Regular.ttf');
    font-family: Ubuntu-Regular;
}
@font-face {
    src: url('chrome-extension://${resourceVariable.id}/fonts/NotoSans-Regular.ttf');
    font-family: NotoSans-Regular;
}
                </style>`

change_image_src = (document) => {
    document.querySelectorAll("img.feature-icon").forEach((img) => {
        img.src = img.src.substr(0, 18) + resourceVariable.id + img.src.substr(21, );
    })
}


loadExtension = (extensionFrame) => { // loads html in newly created extensionFrame and also request for data fetch
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
        extensionFrame.innerHTML += fonts;
        extensionFrame.innerHTML += xhr.responseText;
        change_image_src(extensionFrame);
        document.body.appendChild(extensionFrame);

        fetch_ahead(); // fetch ahead in different file
    };

    xhr.open("get", resourceVariable.index);
    xhr.send();
}

excecute = (click) => { // this is the executor

    deletePreviousElement(resourceVariable.extensionBody);

    [cursorPosition, createExtensionFrame, loadExtension]
    .reduce((previousResult, currentProcedure) => currentProcedure(previousResult), click);

}


filter = () => { // this works even when a bunch of word is selected but currently just one word is going through
    let words = document.getSelection().toString();
    let word_array = [];
    words.split(" ").forEach((word) => {
        try {
            word_array.push(word.match(/[a-zA-Z]+/)[0]);
        } catch {
            console.log("not full word");
        }
    })
    return word_array.length;
}

getStatus = () => { // get extesion Status (on / off)
    let status = new Promise((reslove) => {
        chrome.storage.local.get("status", response => {
            reslove(response.status);
        })
    })
    return status;
}

document.body.addEventListener("dblclick", (async(click) => {

    let status = await getStatus();

    if (status === true && filter()) {
        console.log("excecuting");
        excecute(click);
    } else {
        console.log("status:off or not real word");
    }

}));