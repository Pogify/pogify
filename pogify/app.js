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

var userinfo = {
    uid: undefined,
    ref: undefined,
};

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
            userinfo.uid = uid;
            userinfo.ref = db.ref(`users/${uid}`);
            init_observer_stuff();
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

// The part which monitors Spotify dom

var epico = {
    elem: undefined,
    song: undefined,
    artist: undefined,
    timestamp: undefined,
    playbtn: undefined,
    data: undefined,
}


function init_observer_stuff() {
    var elem = document.querySelectorAll(".now-playing .ellipsis-one-line")[0];
    var song = elem.querySelectorAll("div")[1];
    var artist = elem.querySelectorAll("div")[2];
    var timestamp = document.getElementsByClassName("playback-bar")[0].getElementsByTagName("div")[0];
    var playbtn = document.getElementsByClassName("player-controls")[0].getElementsByTagName("button")[2];
    var data = {
        last_unpaused_timestamp: get_seconds(timestamp.textContent),
        last_unpaused_utc: Date.now() / 1000
    };

    epico.elem = elem;
    epico.song = song;
    epico.artist = artist;
    epico.timestamp = timestamp;
    epico.playbtn = playbtn;
    epico.data = data;

    observe_dom();
}

// Converts timestamp in format of min:sec to seconds
// ex: 0:17 => 17
function get_seconds(timestamp) {
    split = timestamp
        .split(':')
        .map(e => parseInt(e));
    return split[0] * 60 + split[1];
}

function reload() {
    var query = {
        song: epico.song.textContent,
        artist: epico.artist.textContent,
        timestamp: epico.timestamp.textContent,
        timestamp_sec: get_seconds(epico.timestamp.textContent),
        play: !is_paused()
    };
    // console.log(query);
    return query;
}

async function notify() {
    // Replace with firebase request with reload()
    var to_send = reload();
    await userinfo.ref.update(to_send);
}

// Tells whether the timestamp is unexpected or not
function time_weird(timestamp) {
    timestamp_delta = get_seconds(timestamp) - epico.data.last_unpaused_timestamp;
    utc_delta = Date.now() / 1000 - epico.data.last_unpaused_utc;
    return Math.abs(timestamp_delta - utc_delta) > 1;
}

function is_paused() {
    return epico.playbtn.title != "Pause";
}

async function reload_button() {
    console.log("[BUTTON]");
    await notify();
}

async function reload_timestamp() {
    curr_timestamp = epico.timestamp.textContent;
    if (time_weird(curr_timestamp)) {
        console.log("[TIMESTAMP]")
        await notify();
        epico.data.last_unpaused_timestamp = get_seconds(curr_timestamp);
        epico.data.last_unpaused_utc = Date.now() / 1000;
    }
}

// timestamp_observer.disconnect()
// button_observer.disconnect()

function observe_dom() {
    var timestamp_observer = new MutationObserver(reload_timestamp);
    timestamp_observer.observe(epico.timestamp, { characterData: true, subtree: true });

    var button_observer = new MutationObserver(reload_button);
    button_observer.observe(epico.playbtn, { attributes: true, subtree: true });
}

