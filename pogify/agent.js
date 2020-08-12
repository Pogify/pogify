function root(p) {
    return chrome.extension.getURL(p);
}

function load(src) {
    return new Promise((resolve, reject) => {
        var script = document.createElement("script");
        script.onload = () => {
            resolve();
        }
        script.src = src;
        document.head.appendChild(script);
    });
}

document.querySelectorAll("head")[0].innerHTML += `
<meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'" />
`;

fetch(root('/modal.html')).then(response => response.text()).then(data => {
    var elem = document.createElement("div");
    elem.style.zIndex = 5;
    elem.innerHTML = data;
    document.body.appendChild(elem);
}).then(() => {
    return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js").then(() => {
        return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-analytics.js")
    }).then(() => {
        return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-auth.js");
    }).then(() => {
        return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-database.js");
    }).then(() => {
        return load(root("/app.js"));
    });
});