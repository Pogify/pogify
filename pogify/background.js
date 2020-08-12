
/* global chrome */

// List of tabIds where CSP headers are disabled

var onHeadersReceived = function (details) {
    chrome.browsingData.remove({}, { serviceWorkers: true }, function () { });

    for (var i = 0; i < details.responseHeaders.length; i++) {
        if (details.responseHeaders[i].name.toLowerCase() === 'content-security-policy') {
            details.responseHeaders[i].value = '';
        }
    }

    return {
        responseHeaders: details.responseHeaders
    };
};

var init = function () {
    // When Chrome recieves some headers
    var onHeaderFilter = { urls: ['*://*/*'], types: ['main_frame', 'sub_frame'] };
    chrome.webRequest.onHeadersReceived.addListener(
        onHeadersReceived, onHeaderFilter, ['blocking', 'responseHeaders']
    );
    chrome.browserAction.onClicked.addListener(function (tab) {
        chrome.tabs.create({ url: 'https://open.spotify.com/' }, function (tab) {
            // Tab opened.
        });
    });
};

init();