
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
var p = {
    status: document.querySelectorAll("#status")[0],
    song: document.querySelectorAll("#song")[0],
    artist: document.querySelectorAll("#artist")[0],
    link: document.querySelectorAll("#link")[0]
}
if (isMobile) {
    p.status.textContent = "Device not supported";
    p.song.textContent = "Mobile devices are not yet supported.";
    p.artist.textContent = "Stay tuned for future updates!";
    p.link.textContent = "";
} else {
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
                p.status.textContent = "Now Playing";
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
            try {
                val = val.val();
                p.status.textContent = val.playing ? "Loading..." : "Paused";
                p.song.textContent = val.song;
                p.artist.textContent = val.artist;
                p.link.innerHTML = `<i class="fab fa-spotify"></i> Listen on Spotify`;
                p.link.href = val.spotify_link;
                loadVideo(val.video, Math.round((Date.now() - val.event_timestamp) / 1000) + val.timestamp_sec, val.playing);
            } catch (e) {
                p.status.textContent = "Stream Stopped";
                p.song.textContent = "No song";
                p.artist.textContent = "No artists";
                p.link.textContent = "";
                if (player) {
                    player.pauseVideo();
                }
            }
        });
    }
}