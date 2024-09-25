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

let isReceivedPlayingMessage = false;
function onPlay() {
  console.log("===========play=");
  if (isReceivedPlayingMessage) {
    isReceivedPlayingMessage = false;
    return;
  }
  chrome.runtime.sendMessage({ type: "play" });
}
let isReceivedPausingMessage = false;
function onPause() {
  console.log("===========pause=");
  if (isReceivedPausingMessage) {
    isReceivedPausingMessage = false;
    return;
  }
  chrome.runtime.sendMessage({ type: "pause" });
}
let isReceivedSeekingMessage = false;
function onSeeked() {
  console.log("===========seeked=", targetVideo?.currentTime);
  if (isReceivedSeekingMessage) {
    isReceivedSeekingMessage = false;
    return;
  }
  chrome.runtime.sendMessage({
    type: "seek",
    time: targetVideo.currentTime,
  });
}

chrome.runtime.onMessage.addListener(function (message) {
  switch (message.type) {
    case "play":
      console.log("===receive-play");
      if (targetVideo.paused) {
        isReceivedPlayingMessage = true;
        targetVideo.play();
      }
      break;
    case "pause":
      console.log("===receive-pause");
      if (!targetVideo.paused) {
        isReceivedPausingMessage = true;
        targetVideo.pause();
      }
      break;
    case "seek":
      console.log("===receive-seek", targetVideo.currentTime, message.time);
      if (targetVideo.currentTime !== message.time) {
        isReceivedSeekingMessage = true;
        targetVideo.currentTime = message.time;
      }
      break;
    default:
      break;
  }
});
