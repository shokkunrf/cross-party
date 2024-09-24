import mqtt from "mqtt";

const brokerUrl = import.meta.env.VITE_BROKER_URL as string;
const username = import.meta.env.VITE_BROKER_USERNAME as string;
const password = import.meta.env.VITE_BROKER_PASSWORD as string;
const primevideoUrl = import.meta.env.VITE_PRIMEVIDEO_URL as string;

function randomString(length: number): string {
  return Math.random().toString(36).slice(-length);
}

const clientId = randomString(8);

const client = mqtt.connect(brokerUrl, {
  clean: true,
  connectTimeout: 4000,
  // reconnectPeriod: 1000,
  clientId,
  username,
  password,
});

let tabIdState: number | undefined;
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.indexOf(primevideoUrl) !== -1
  ) {
    console.log("tab updated2: ", tabId);
    tabIdState = tabId;
    // chrome.tabs.executeScript(tabId, { file: "../content/main.ts-loader.js" }, (res) => {
    //   console.log("aaaaaaaaaa", res);
    // });
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
      topic = request.roomID;
      if (!topic) {
        sendResponse({ isConnected: false });
      }

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
