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
    
    // need to load app firt
    await load("https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js");
    console.log("[LOAD] " + "https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js");

    firebase_urls = [
        "https://www.gstatic.com/firebasejs/7.17.2/firebase-analytics.js",
        "https://www.gstatic.com/firebasejs/7.17.2/firebase-auth.js",
        "https://www.gstatic.com/firebasejs/7.17.2/firebase-database.js"
    ];
    firebase_url_count = firebase_urls.length;
    firebase_urls.forEach(async (url) => {
        await load(url);
        console.log("[LOAD] " + url);
        firebase_url_count--;

        // if all the firebase stuff has loaded
        if (!firebase_url_count) {
            await load(root("/app.js"));
            console.log("[LOAD] app");
        }
    })
}

load_firebase().catch(e => {
    console.log("[ERROR] " + e);
});
