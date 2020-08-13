var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var fbConfig = {
    apiKey: "AIzaSyAkaNtHvfJIMLWeWeh1DXLvcN7ybA2yKeo",
    authDomain: "pogify-database.firebaseapp.com",
    databaseURL: "https://pogify-database.firebaseio.com/",
    projectId: "pogify-database",
};
firebase.initializeApp(fbConfig);
var db = firebase.database();
var frame = document.querySelectorAll("iframe")[0];
var currentVideoID = "";
var player;
var loadVideo;

// https://developers.google.com/youtube/iframe_api_reference
function onYouTubeIframeAPIReady() {
    function loadVideoInternal(id, start, playing) {
        console.log(id, start, playing);
        if (id == currentVideoID) {
            console.log("Seeking " + id);
            player.seekTo(start);
        } else {
            console.log("Loading " + id);
            player.loadVideoById({
                videoId: id,
                startSeconds: start
            });
        }
        if (playing) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
        currentVideoID = id;
    }

    loadVideo = (id, start, playing) => {
        if (!player) {
            player = new YT.Player('frame_div', {
                height: '390',
                width: '640',
                events: {
                    onReady: () => {
                        loadVideoInternal(id, start, playing);
                    }
                }
            });
        } else {
            loadVideoInternal(id, start, playing);
        }
    }

    db.ref(`users/${window.location.hash.substr(1)}`).on("value", val => {
        val = val.val();
        loadVideo(val.video, Math.round((Date.now() - val.event_timestamp) / 1000) + val.timestamp_sec, val.playing);
    });
}