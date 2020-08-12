var config = {
    apiKey: "AIzaSyAkaNtHvfJIMLWeWeh1DXLvcN7ybA2yKeo",
    authDomain: "pogify-database.firebaseapp.com",
    databaseURL: "https://pogify-database.firebaseio.com/",
    projectId: "pogify-database",
};
firebase.initializeApp(config);
var db = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(function () {
        firebase.auth().onAuthStateChanged((user) => {
            document.querySelectorAll("button")[0].remove();
            uid = user.uid;
            console.log(user);

            db.ref("users").child(uid).update({
                name: "Kento"
            });
            db.ref("users").child("ronak").update({
                name: "Kento"
            });
        });
    });
function auth() {
    firebase.auth().signInWithPopup(provider).catch(function (error) {
        console.log(error);
    });
}