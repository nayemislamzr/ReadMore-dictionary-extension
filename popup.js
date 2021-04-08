const componants = {
    checkbox: document.querySelector("input#checkbox"),
    slider: document.querySelector("span[class='slider round']"),
    header: document.querySelector("header"),
    logo: document.querySelectorAll("div.logo"),
    myinfo: document.querySelector("div#myinfo"),
    option: document.querySelector("div#option"),
}

function getStatus() {
    const status = new Promise((resolve) => {
        chrome.storage.local.get("status", response => {
            resolve(response.status);
        })
    })
    return status;
}

function config(status) {
    if (status) {
        stateON();
    } else {
        stateOFF();
    }
}

function btnCheckedStyle() {
    componants.header.style.backgroundColor = "var(--header-clicked)";
    for (node of componants.logo) {
        node.style.backgroundImage = "linear-gradient( #4ceadb 50% , var(--header-clicked) 50%)";
    }
}

function btnUncheckedStyle() {
    componants.header.style.backgroundColor = "var(--header-not-clicked)"
    for (node of componants.logo) {
        node.style.backgroundImage = "linear-gradient(#f70e7a 50%,#e91a7b 50%)";
    }
}

function stateON() {
    chrome.browserAction.setBadgeBackgroundColor({ color: [66, 217, 250, 1] });
    chrome.browserAction.setBadgeText({ text: "on" });
    btnCheckedStyle();
    componants.checkbox.checked = true;
}

function stateOFF() {
    chrome.browserAction.setBadgeBackgroundColor({ color: [247, 14, 122, 1] });
    chrome.browserAction.setBadgeText({ text: "off" });
    btnUncheckedStyle();
    componants.checkbox.checked = false;
}

function switchONOff() {
    componants.checkbox.addEventListener("change", async() => {
        const status = await getStatus();
        //if on then turn it to off
        //if off then turn it to on
        if (status) {
            stateOFF();
            chrome.storage.local.set({ status: false });
        } else {
            stateON();
            chrome.storage.local.set({ status: true });
        }
    });
}

function clickEvents() {
    componants.myinfo.addEventListener("click", () => {
        window.open("personal.html", "_blank");
    })

    componants.option.addEventListener("click", () => {

        try {
            chrome.runtime.openOptionsPage();
        } catch {
            window.open("option.html", "_blank");
        }
    })
}



async function init() {

    const status = await getStatus();
    config(status);
    switchONOff();
    clickEvents();

}

document.addEventListener("DOMContentLoaded", init);