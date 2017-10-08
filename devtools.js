// Can use
// chrome.devtools.*
// chrome.extension.*

var backgroundPageConnection, getOriginalCSSFiles, stylesheets, panWin;

// Create a tab in the devtools area
chrome.devtools.panels.create("CSS Changes", "toast.png", "panel.html", function (panel) {
    getOriginalCSSFiles();

    panel.onShown.addListener(function showPanel(panel_window) {
        // Need to get original CSS from storage prior to getting the current changed
        backgroundPageConnection.postMessage({
            tabId: chrome.devtools.inspectedWindow.tabId,
            styleSheets: styleSheets,
            method: 'get'
        });

        panWin = panel_window;
    });
});

backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools-page'
});

backgroundPageConnection.onMessage.addListener(function (styleSheets) {
    console.log('getting message back from background.js', styleSheets);
    // Handle responses from the background page, if any

    panWin.getCSSResources(styleSheets);
});

getOriginalCSSFiles = function () {
    var styles, totalNumOfSheet = 0;
    styleSheets = [];

    console.log('getOriginalCSSFiles called');

    chrome.devtools.inspectedWindow.getResources(function (resources) {
        resources.forEach(function (resource) {
            if (resource.type === 'stylesheet' && resource.url && resource.url.indexOf('.css') > -1) {
                ++totalNumOfSheet;
                resource.getContent(function (content, encoding) {
                    // Request context script to get css files. 
                    // These files should only be requested and saved in storage for retrieval and next page refresh
                    styleSheets.push({ url: resource.url, content: content, tabId: chrome.devtools.inspectedWindow.tabId });
                    if (styleSheets.length === totalNumOfSheet) {
                        // All expected sheet have been found. Send a message up to background
                        backgroundPageConnection.postMessage({
                            tabId: chrome.devtools.inspectedWindow.tabId,
                            styleSheets: styleSheets,
                            method: 'post'
                        });
                    }
                });
            }
        });
    });
}

