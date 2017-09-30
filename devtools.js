// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area
chrome.devtools.panels.create("CSS Changes", "toast.png", "panel.html", function (panel) {
    panel.onShown.addListener(function showPanel(panel_window) {
        panel_window.getCSSResources();
    });    
});