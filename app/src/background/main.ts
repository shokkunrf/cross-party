import mqtt from "mqtt";
import { broker } from "../config/env";
import { primevideoUrls } from "../config/target-host";
import { main as content } from "../content/main";

function randomString(length: number): string {
  return Math.random().toString(36).slice(-length);
}

const clientId = randomString(8);

const client = mqtt.connect(broker.url, {
  clean: true,
  connectTimeout: 4000,
  // reconnectPeriod: 1000,
  clientId,
  username: broker.username,
  password: broker.password,
});

let tabIdState: number | undefined;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    primevideoUrls.some((url) => tab.url!.includes(url))
  ) {
    if (tabIdState !== tabId) {
      tabIdState = tabId;
      chrome.scripting.executeScript({
        target: { tabId },
        func: content,
      });
    }
  }
});

const userID = randomString(8);

client.on("message", (topic, message) => {
  console.log("received: ", topic, message.toString());
  const msg = JSON.parse(message.toString());

  if (!tabIdState) {
    return;
  }
  if (msg.userID !== userID) {
    console.log("send message to content script:", msg);
    chrome.tabs.sendMessage(tabIdState, msg);
  }
});

client.on("connect", () => {
  console.log("connected: ", client.connected);
});
client.on("close", () => {
  console.log("disconnected: ", client.connected);
});
client.on("reconnect", () => {
  console.log("reconnecting: ", client.connected);
});

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let isSubscribed = false;
function isConnected() {
  return isSubscribed && client.connected;
}

let topic = "";

async function switchResponse(
  request:
    | JoinRequest
    | ConnectionCheckRequest
    | PlayRequest
    | PauseRequest
    | SeekRequest,
  sendResponse: (response: JoinResponse | ConnectionCheckResponse) => void
) {
  switch (request.type) {
    case "join":
      if (!request.roomID) {
        client.unsubscribe(topic);
        topic = "";
        isSubscribed = false;
        sendResponse({ isConnected: false });
        return;
      }
      if (topic === request.roomID) {
        sendResponse({ isConnected: isConnected() });
        return;
      }

      if (topic) {
        client.unsubscribe(topic);
      }

      topic = request.roomID;
      isSubscribed = await client
        .subscribeAsync(topic)
        .then((_) => {
          return client.connected;
        })
        .catch((err) => {
          // This client can't reconnect if the client does not unsubscribe this topic
          client.unsubscribe(topic);
          console.error(err);
          return false;
        });
      sendResponse({ isConnected: isConnected() });
      break;
    case "connect":
      sendResponse({ isConnected: isConnected() });
      break;
    case "play": {
      console.log("=====play");
      if (topic) {
        const message = { type: "play", userID };
        client.publish(topic, JSON.stringify(message));
      }
      break;
    }
    case "pause": {
      console.log("=====pause");
      if (topic) {
        const message = { type: "pause", userID };
        client.publish(topic, JSON.stringify(message));
      }
      break;
    }
    case "seek": {
      console.log("=====seek");
      if (topic) {
        const message = { type: "seek", time: request.time, userID };
        client.publish(topic, JSON.stringify(message));
      }
      break;
    }
    default:
      break;
  }
}

chrome.runtime.onMessage.addListener(function (
  request:
    | JoinRequest
    | ConnectionCheckRequest
    | PlayRequest
    | PauseRequest
    | SeekRequest,
  _sender,
  sendResponse: (response: JoinResponse | ConnectionCheckResponse) => void
) {
  switchResponse(request, sendResponse);
  return true;
});
