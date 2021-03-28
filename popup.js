const componants = {
    checkbox: document.querySelector("input#checkbox"),
    slider: document.querySelector("span[class='slider round']"),
    header: document.querySelector("header"),
    logo: document.querySelectorAll("img.logo"),
}

function config() {
    chrome.storage.local.get("status", (res) => {
        status = res.status;
        if (status == "true") {
            checked_style();
            componants.checkbox.checked = true;
        } else {
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
                unchecked_style();
                chrome.storage.local.set({ "status": "false" });
            } else {
                console.log("current status : off");
                // turning on
                checked_style();
                chrome.storage.local.set({ "status": "true" });
            }
        });

    });
}

init();