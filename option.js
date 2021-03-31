componants = {
    themes: document.querySelector("body div#themes div.radio-select"),
}

componants.themes.addEventListener("change", (item) => {
    chrome.storage.local.set({ "theme": item.target.id });
})