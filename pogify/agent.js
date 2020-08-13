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

firebase_url_count = { amount: 0 };

if (!document.head.getElementsByClassName("nocors").length) {
    document.head.innerHTML += `
  <meta class="nocors" http-equiv="Content-Security-Policy" content="default-src *; media-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'" />
  `;
}

async function load_firebase() {
    await fetch(root('/modal.html')).then(response => response.text()).then(data => {
        var elem = document.createElement("div");
        elem.style.zIndex = 5;
        elem.innerHTML = data;
        document.body.appendChild(elem);
    });
    let fetchStyle = function (url) {
        return new Promise((resolve, reject) => {
            let link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.onload = function () { resolve(); console.log('style has loaded'); };
            link.href = url;

            let headScript = document.querySelector('script');
            headScript.parentNode.insertBefore(link, headScript);
        });
    };
    // await fetchStyle("https://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css");
    firebase_urls = [
        "https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js",
        "https://www.gstatic.com/firebasejs/7.17.2/firebase-analytics.js",
        "https://www.gstatic.com/firebasejs/7.17.2/firebase-auth.js",
        "https://www.gstatic.com/firebasejs/7.17.2/firebase-database.js"
        // root("/app.js")
    ];
    firebase_url_count.amount = firebase_urls.length;
    firebase_urls.forEach(async (url) => {
        await load(url);
        console.log("[LOAD] " + url);
        firebase_url_count.amount--;
        // if all the firebase stuff has loaded
        if (!firebase_url_count.amount) {
            await load(root("/app.js"));
            console.log("[LOAD] app");
        }
    })
    // await load(root("/app.js"));
    // console.log("[LOAD] app");
    // await load("https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js");
    // .then(() => {
    // return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js").then(() => {
    //     return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-analytics.js")
    // }).then(() => {
    //     return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-auth.js");
    // }).then(() => {
    //     return load("https://www.gstatic.com/firebasejs/7.17.2/firebase-database.js");
    // }).then(() => {
    //     return load(root("/app.js"));
    // });
}

load_firebase().catch(e => {
    console.log("[ERROR] " + e);
});
