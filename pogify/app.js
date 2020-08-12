var fbConfig = {
    apiKey: "AIzaSyAkaNtHvfJIMLWeWeh1DXLvcN7ybA2yKeo",
    authDomain: "pogify-database.firebaseapp.com",
    databaseURL: "https://pogify-database.firebaseio.com/",
    projectId: "pogify-database",
};
firebase.initializeApp(fbConfig);
var db = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();

var elem = document.querySelectorAll("#logInPrompt")[0];
window.onload = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("User:", user);
            elem.setAttribute("hidden", "true");
            uid = user.uid;
        } else {
            elem.removeAttribute("hidden");
        }
    });
};
function auth() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider).catch(function (error) {
        console.log(error);
    });
}
document.querySelectorAll("#signInButton")[0].onclick = auth;