chrome.runtime.onMessage.addListener(
    ((request, sender, sendResponse) => {
        switch (request.sender) {
            case "popup":
                console.log(`The request was from ${request.sender}\n
                The message was : ${request.message}`);
                if (request.message === "true") {
                    console.log("you have the permission mate");
                    // chrome.tabs.sendMessage(tabs[0].id, "ON");
                } else if (request.message === "false") {
                    console.log("sorry mam , you can not enter");
                }
                sendResponse({
                    "reciever": "background",
                    "message": "Exceuted successfully"
                })
                return true;
            case "content":
                console.log(`The request was from ${request.sender}\n
                The message was : ${request.message}`);
        }
        return true;
    }))

// chrome.storage.local.set("index", chrome.extension.getURL("/index.html"));