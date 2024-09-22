console.log("===content.js");

let targetVideo: HTMLVideoElement;
const getting = setInterval(() => {
  const videoes = document.getElementsByTagName("video");
  if (videoes.length !== 0) {
    // targetVideo is the video that last fired "seeked" event
    for (const video of videoes) {
      video.addEventListener("seeked", (_) => {
        if (targetVideo === video) {
          return;
        }
        if (targetVideo) {
          targetVideo.removeEventListener("play", onPlay);
          targetVideo.removeEventListener("pause", onPause);
          targetVideo.removeEventListener("seeked", onSeeked);
        }
        targetVideo = video;
        targetVideo.addEventListener("play", onPlay);
        targetVideo.addEventListener("pause", onPause);
        targetVideo.addEventListener("seeked", onSeeked);
      });
    }
    clearInterval(getting);
  }
}, 2000);

function onPlay() {
  console.log("===========play=");
  chrome.runtime.sendMessage({ type: "play" });
}
function onPause() {
  console.log("===========pause=");
  chrome.runtime.sendMessage({ type: "pause" });
}
function onSeeked() {
  console.log("===========seeked=", targetVideo?.currentTime);
  chrome.runtime.sendMessage({
    type: "seek",
    time: targetVideo.currentTime,
  });
}

chrome.runtime.onMessage.addListener(function (message) {
  switch (message.type) {
    case "play":
      console.log("===receive-play");
      targetVideo.play();
      break;
    case "pause":
      console.log("===receive-pause");
      targetVideo.pause();
      break;
    case "seek":
      console.log("===receive-seek", message.time);
      targetVideo.currentTime = message.time;
      break;
    default:
      break;
  }
});
