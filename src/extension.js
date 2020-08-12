var elem = document.querySelectorAll(".now-playing .ellipsis-one-line")[0];
var song = elem.querySelectorAll("div")[1];
var artist = elem.querySelectorAll("div")[2];
var timestamp = document.getElementsByClassName("playback-bar")[0].getElementsByTagName("div")[0];
var playbtn = document.getElementsByClassName("player-controls")[0].getElementsByTagName("button")[2];
var data = {
  last_unpaused_timestamp: get_seconds(timestamp.textContent),
  last_unpaused_utc: Date.now()/1000
};

// Converts timestamp in format of min:sec to seconds
// ex: 0:17 => 17
function get_seconds(timestamp) {
  split = timestamp
    .split(':')
    .map(e => parseInt(e));
  return split[0]*60 + split[1];
}

function reload() {
  var query = {
    song: song.textContent,
    artist: artist.textContent,
    timestamp: timestamp.textContent,
    timestamp_sec: get_seconds(timestamp.textContent),
    play: !is_paused()
  };
  console.log(query);
  return query;
}

function notify() {
  // Replace with firebase request with reload()
  console.log("SOMETHING CHANGED");
}

// Tells whether the timestamp is unexpected or not
function time_weird(timestamp) {
  timestamp_delta = get_seconds(timestamp) - data.last_unpaused_timestamp;
  utc_delta = Date.now()/1000 - data.last_unpaused_utc;
  return Math.abs(timestamp_delta-utc_delta) > 1;
}

function is_paused() {
  return playbtn.title != "Pause";
}

function reload_button() {
  console.log("[BUTTON]");
  notify();
}

function reload_timestamp() {
  curr_timestamp = timestamp.textContent;
  if (time_weird(curr_timestamp)) {
    console.log("[TIMESTAMP]")
    notify();
    data.last_unpaused_timestamp = get_seconds(curr_timestamp);
    data.last_unpaused_utc = Date.now()/1000;
  }
}

// timestamp_observer.disconnect()
// button_observer.disconnect()

var timestamp_observer = new MutationObserver(reload_timestamp);
timestamp_observer.observe(timestamp, {characterData: true, subtree: true});

var button_observer = new MutationObserver(reload_button);
button_observer.observe(playbtn, {attributes: true, subtree: true});

