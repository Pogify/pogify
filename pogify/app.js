var fbConfig = {
    apiKey: "AIzaSyAkaNtHvfJIMLWeWeh1DXLvcN7ybA2yKeo",
    authDomain: "pogify-database.firebaseapp.com",
    databaseURL: "https://pogify-database.firebaseio.com/",
    projectId: "pogify-database",
};
firebase.initializeApp(fbConfig);
var db = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();

var modal = document.querySelectorAll("#logInPrompt")[0];

function auth() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function (error) {
        console.log(error);
    });
}

function newButton(id, content) {
    document.querySelectorAll("div.Root__top-bar > header > div")[1].insertAdjacentHTML(
        'beforEend',
        `<button type="button" class="modalButton" id="${id}" style="margin-right: 20px;">${content}</button>`
    );
    return document.querySelectorAll("#" + id)[0];
}

function copy(text) {
    var input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

// window.addEventListener('load', (event) => {

function copyLink(link) {
    copy(link);
    var span = document.querySelectorAll("#copyLinkButton > span")[0];
    span.textContent = "Copied!";
    setTimeout(() => {
        span.textContent = "Copy URL";
    }, 1000);
}

function loaded() {
    if (document.querySelectorAll("div.Root__top-bar > header > div").length < 2) {
        setTimeout(loaded, 100);
        return;
    }
    var accountToggle = newButton("accountToggle", "Loading Pogify...");
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("User:", user);
            accountToggle.textContent = "Stop Pogify Session";
            accountToggle.classList.add("redButton");
            accountToggle.onclick = () => {
                console.log(1);
                firebase.auth().signOut();
            };
            var shareSession = newButton("shareSessionButton", "Share Session");
            var link = window.location.href;
            shareSession.onclick = () => {
                popup("Pogify Session", `
                <input value="${link}" id="linkBox" readonly 
                onclick="this.setSelectionRange(0, this.value.length);" oncontextmenu="copyLink(this.value);"></input>
                <br>
                <a style="cursor:pointer;" id="copyLinkButton">
                    <i class="fas fa-clipboard"></i> <span>Copy URL</span>
                </a>
                `, "Share URL", () => {
                    const shareData = {
                        title: 'Pogify',
                        text: 'Listen to music with chat without getting DMCA-striked!',
                        url: link,
                    }
                    navigator.share(shareData);
                });

                document.querySelectorAll("#copyLinkButton")[0].onclick = (event) => {
                    copyLink(link);
                }
            };
            var uid = user.uid;
        } else {
            // popup("Sign in to Pogify", "Sign in with your Google account to stream your music on Pogify.", "Sign in", auth);
            accountToggle.textContent = "Start Pogify Session";
            accountToggle.classList.remove("redButton");
            accountToggle.onclick = auth;
            document.querySelectorAll("#shareSessionButton")[0].remove();
        }
    });
}

window.onload = loaded;

function closePopup() {
    modal.setAttribute("hidden", "true");
}

function popup(title, text, button, callback) {
    document.querySelectorAll("#modalTitle")[0].textContent = title;
    document.querySelectorAll("#modalText")[0].innerHTML = text;
    document.querySelectorAll("#modalActionButton")[0].textContent = button;
    document.querySelectorAll("#modalActionButton")[0].onclick = callback;
    document.querySelectorAll("#modalCloseButton")[0].onclick = closePopup;
    modal.removeAttribute("hidden");
}
