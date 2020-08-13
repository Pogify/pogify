
/* global chrome */

// List of tabIds where CSP headers are disabled

var onHeadersReceived = function (details) {
    chrome.browsingData.remove({}, { serviceWorkers: true }, function () { });

    for (var i = 0; i < details.responseHeaders.length; i++) {
        if (details.responseHeaders[i].name.toLowerCase() === 'content-security-policy') {
            details.responseHeaders[i].value = "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';";
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
};

init();
