const componants = {
    checkbox: document.querySelector("input#checkbox"),
    slider: document.querySelector("span[class='slider round']"),
    header: document.querySelector("header"),
    logo: document.querySelectorAll("div.logo"),
    myinfo: document.querySelector("div#myinfo"),
    option: document.querySelector("div#option"),
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

class storage {

    static addkey = () => {

    }

    static get = () => {
        const cachePromise = new Promise((resolve, reject) => {
            chrome.storage.local.get(key, (response) => {
                if (!(key in response)) {
                    reject("not found in cache");
                } else {
                    console.log("found");
                    resolve(response[key]);
                }

            })
        });
        return cachePromise;
    }

    static update = (key, obj) => {
        chrome.storage.local.set({ key: obj });
    }

    static clear = () => {

    }

    static remove = () => {

    }

}

async function init() {
    config();

    try {

    } catch (error) {
        console.error(error);
    }

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
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open("option.html", "_blank");
        }
    })
}

document.addEventListener("DOMContentLoaded", init);