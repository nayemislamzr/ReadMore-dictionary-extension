componants = {
    themes: document.querySelector("body div#themes div.radio-select"),
    saved: document.querySelector("body .saved"),
    radio_select: document.querySelectorAll("body .radio-select input"),
    cache_check: document.querySelector("body input#cache-checkbox"),
    cache_range: document.querySelector("body input#cache-range"),
    cache_value: document.querySelector("body span#cache-value"),
    reset_settings: document.querySelector("body button#reset-settings"),
    clear_data: document.querySelector("body button#clear-data")
}

function get_pref() {
    const pref_get = new Promise((resolve, reject) => {
        chrome.storage.local.get("preference", (response) => {
            let pref = response.preference;
            // console.log(pref);
            // console.log("preference achieved");
            resolve(pref);
        })
    })
    return pref_get;
}

function create_new_pref() {
    chrome.storage.local.set({ "preference": {} });
    let new_pref = {
        "allow-site": "all",
        "cache": false,
        "themes": "light",
        "cache-value": 0,
    };
    return new_pref;
}

function show_prev_pref(old_pref) {

    //ALL THE RADIO SELECT
    //theme
    document.querySelector(`div#themes`).querySelector(`input#${old_pref["themes"]}`).checked = true;

    //allow-site
    document.querySelector(`div#allowed-sites`).querySelector(`input#${old_pref["allow-site"]}`).checked = true;


    //CACHE DOM SHOW
    console.log(old_pref);
    componants.cache_range.value = old_pref["cache-value"];
    componants.cache_check.checked = old_pref["cache"];
    componants.cache_value.innerText = `${old_pref["cache-value"]} words`;


}


function change_pref() {
    function show_saved() {
        componants.saved.style.display = "block";
        setTimeout(() => {
            componants.saved.style.display = "none";
        }, 1000);
    }

    function save_item(name, value) {
        // console.log("getting preference");
        // console.log(name, value);
        get_pref().then((pref) => {
            try {
                // console.log("setting preference");
                pref[name] = value;
                // console.log(pref);
                chrome.storage.local.set({ preference: pref });
            } catch {
                let new_pref = create_new_pref();
                new_pref[name] = value;
                chrome.storage.local.set({ preference: new_pref });
            }
        })

    }

    componants.radio_select.forEach((select) => {
        select.addEventListener("click", (item) => {
            switch (item.target.type) {
                case "radio":
                    {
                        save_item(item.target.name, item.target.id);
                        break;
                    }

                case "checkbox":
                    {
                        save_item(item.target.name, item.target.checked);
                        break;
                    }
            }

            show_saved();
        })
    })

    componants.cache_range.addEventListener("change", (e) => {
        // console.log(e.target.value);
        get_pref()
            .then((pref) => {
                try {
                    console.log(e.target.value);
                    pref["cache-value"] = e.target.value;
                    componants.cache_value.innerText = `${e.target.value} words`;
                    chrome.storage.local.set({ preference: pref })
                } catch {
                    let new_pref = create_new_pref();
                    new_pref["cache-value"] = value;
                    componants.cache_value.innerText = `${e.target.value} words`;
                    chrome.storage.local.set({ preference: new_pref });
                }
            })
    })

    componants.reset_settings.addEventListener("click", () => {
        if (confirm("This will change all settings to default")) {
            // console.log("erasing all your settings + word cache");
            chrome.storage.local.remove("preference");
            let new_preference = create_new_pref();
            chrome.storage.local.set({ preference: new_preference });
        } else {
            // console.log("nothing happend ");
        }
    })

    componants.clear_data.addEventListener("click", () => {
        if (confirm("This will remove all the cached words")) {
            // console.log("erasing all your settings + word cache");
            chrome.storage.local.clear();
            let new_preference = create_new_pref();
            chrome.storage.local.set({ preference: new_preference });
        } else {
            // console.log("nothing happend ");
        }
    })
}

const init = (async() => {
    //get all the previous saved preference
    // console.log("getting pref")
    let prev_pref = await get_pref();

    //show all the previous saved preference
    // console.log("showing");
    show_prev_pref(prev_pref);

    // console.log("preparing")
    //change preference
    change_pref();
})()