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
    firebase.auth().signInWithRedirect(provider).catch(function (error) {
        console.log(error);
    });
}

function newButton(id, content) {
    document.querySelectorAll("#main > div > div.Root__top-container > div.Root__top-bar > header > div")[1].innerHTML +=
        `<button type="button" class="modalButton" id="${id}" style="margin-right: 20px;">${content}</button>`;
}

window.onload = () => {
    newButton("accountToggle", "Loading Pogify...");
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("User:", user);
            document.querySelectorAll("#accountToggle")[0].textContent = "Stop Pogify Session";
            document.querySelectorAll("#accountToggle")[0].onclick = () => {
                firebase.auth().signOut();
            };
            var uid = user.uid;
        } else {
            // popup("Sign in to Pogify", "Sign in with your Google account to stream your music on Pogify.", "Sign in", auth);
            document.querySelectorAll("#accountToggle")[0].textContent = "Start Pogify Session";
            document.querySelectorAll("#accountToggle")[0].onclick = auth;

        }
    });

};

function closePopup() {
    modal.setAttribute("hidden", "true");
}

function popup(title, text, button, callback) {
    document.querySelectorAll("#modalTitle")[0].textContent = title;
    document.querySelectorAll("#modalText")[0].textContent = text;
    document.querySelectorAll("#modalActionButton")[0].textContent = button;
    document.querySelectorAll("#modalActionButton")[0].onclick = callback;
    document.querySelectorAll("#modalCloseButton")[0].onclick = closePopup;
    modal.removeAttribute("hidden");
}
