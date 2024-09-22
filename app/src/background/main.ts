import mqtt from "mqtt";

const brokerUrl = import.meta.env.VITE_BROKER_URL as string;
const clientId = import.meta.env.VITE_BROKER_CLIENT_ID as string;
const username = import.meta.env.VITE_BROKER_USERNAME as string;
const password = import.meta.env.VITE_BROKER_PASSWORD as string;

const client = mqtt.connect(brokerUrl, {
  clean: true,
  connectTimeout: 4000,
  // reconnectPeriod: 1000,
  clientId,
  username,
  password,
});

client.on("message", (topic, message) => {
  // message is Buffer
  console.log("received: ", topic, message.toString());
});
// client.end();

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

async function switchResponse(
  request: JoinRequest | ConnectionCheckRequest,
  sendResponse: (response: JoinResponse | ConnectionCheckResponse) => void
) {
  switch (request.type) {
    case "join":
      const topic = request.roomID;

      isSubscribed = await client
        .subscribeAsync(topic)
        .then((grants) => {
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
    default:
      break;
  }
}

chrome.runtime.onMessage.addListener(function (
  request: JoinRequest | ConnectionCheckRequest,
  sender,
  sendResponse: (response: JoinResponse | ConnectionCheckResponse) => void
) {
  switchResponse(request, sendResponse);
  return true;
});
