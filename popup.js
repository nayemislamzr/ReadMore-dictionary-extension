const componants = {
    checkbox: document.querySelector("input#checkbox"),
    slider: document.querySelector("span[class='slider round']"),
    header: document.querySelector("header"),
    logo: document.querySelectorAll("img.logo"),
    myinfo: document.querySelector("img#myinfo"),
    option: document.querySelector("img#option"),
}

function config() {
    chrome.storage.local.get("status", (res) => {
        status = res.status;
        if (status == "true") {
            chrome.browserAction.setBadgeBackgroundColor({ color: [66, 217, 250, 1] });
            chrome.browserAction.setBadgeText({ text: "on" });
            checked_style();
            componants.checkbox.checked = true;
        } else {
            chrome.browserAction.setBadgeBackgroundColor({ color: [247, 14, 122, 1] });
            chrome.browserAction.setBadgeText({ text: "off" });
            unchecked_style();
            componants.checkbox.checked = false;
        }
    })
}

const checked_style = function() {
    componants.header.style.backgroundColor = "var(--header-clicked)";
    for (node of componants.logo) {
        node.style.backgroundImage = "linear-gradient( #4ceadb 50% , var(--header-clicked) 50%)";
    }
}

const unchecked_style = function() {
    componants.header.style.backgroundColor = "var(--header-not-clicked)"
    for (node of componants.logo) {
        node.style.backgroundImage = "linear-gradient(#f70e7a 50%,#e91a7b 50%)";
    }
}

function init() {
    $(document).ready(config());

    componants.checkbox.addEventListener("change", () => {
        chrome.storage.local.get("status", (res) => {
            status = res.status;
            if (status == "true") {
                console.log("current status : on");
                // turning off
                chrome.browserAction.setBadgeBackgroundColor({ color: [247, 14, 122, 1] });
                chrome.browserAction.setBadgeText({ text: "off" });
                unchecked_style();
                chrome.storage.local.set({ "status": "false" });
            } else {
                console.log("current status : off");
                // turning on
                chrome.browserAction.setBadgeBackgroundColor({ color: [66, 217, 250, 1] });
                chrome.browserAction.setBadgeText({ text: "on" });
                checked_style();
                chrome.storage.local.set({ "status": "true" });
            }
        });

    });

    componants.myinfo.addEventListener("click", () => {
        window.open("personal.html", "_blank");
    })

    componants.option.addEventListener("click", () => {
        window.open("option.html", "_blank");
    })
}

init();