chrome.runtime.onMessage.addListener(function (
  request: JoinRequest,
  sender,
  sendResponse: (response: JoinResponse) => void
) {
  console.log(`Received`, request);
  sendResponse({ response: "Response from background script" });
});
