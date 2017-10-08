var setStorage, getStorage;

// Every time the page is reloaded the previous saved storage on that id need to be removed
chrome.webNavigation.onCompleted.addListener(function (details) {
    console.log('page has been loaded', details.tabId);
    chrome.storage.local.getBytesInUse(null, function (bytesinuse) {
        console.log('byes in use ', bytesinuse);
    });

    chrome.storage.local.get(null, function (data) {
        var keys = Object.keys(data), sheet, i;

        if (data || keys.length > 0) {
            console.log('Searching through storage to view which sheets to delete');
            for (i = 0; i < keys.length; ++i) {
                sheet = data[keys[i]];
                if (sheet.tabId === details.tabId) {
                    console.log('removing ', keys[i]);
                    chrome.storage.local.remove(keys[i]);
                }
            }
            console.log('Searching complete');

            chrome.storage.local.getBytesInUse(null, function (bytesinuse) {
                console.log('byes in use ', bytesinuse);
            });
        } else {
            console.log('chrome stoage is empty. Skipping the delete phase on page load');
        }
    });
});

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (request) {
        switch (request.method) {
            case 'post':
                setStorage(request);
                break;
            case 'get':
                setStorage(request, port);
                break;
        }
    });
});

setStorage = function (request, port) {
    var count = 0;

    if (request && request.styleSheets) {
        request.styleSheets.forEach(function (_, i, a) {
            var sheet = a[i];

            chrome.storage.local.get(sheet.url, function (savedSheet) {
                var newObj;

                // If any item has not already been set, this is the first time this page setting
                if (!savedSheet || Object.keys(savedSheet).length === 0) {
                    newObj = {};
                    newObj[sheet.url] = { content: sheet.content, tabId: sheet.tabId };
                    console.log(sheet.url + ' has not been saved. Saving first');

                    chrome.storage.local.set(newObj, function () {
                        console.log('successfully saved', sheet.url);
                        ++count;
                        if (port) {
                            postBack(port, request, count);
                        }
                    });
                } else {
                    sheet.content = savedSheet[sheet.url];
                    ++count;

                    console.log(sheet.url + ' already exists. Returning storage resource');
                    if (port) {
                        postBack(port, request, count);
                    }
                }
            });
        });
    }
};

postBack = function (port, request, count) {
    console.log(request.styleSheets.length, count);
    chrome.storage.local.getBytesInUse(null, function (bytesinuse) {
        console.log('byes in use ', bytesinuse);
    });
    if (request.styleSheets.length === count) {
        // Ready to post back to devtools with original css files
        console.log('attempting to send message back to devtools');
        port.postMessage(request.styleSheets);
    }
}