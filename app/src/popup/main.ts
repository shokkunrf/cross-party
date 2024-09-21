import "./style.css";

const roomInput = document.getElementById("roomInput")! as HTMLInputElement;
chrome.storage.local.get("roomID", (items) => {
  roomInput.value = items.roomID ?? "";
});

document.getElementById("regenerateButton")?.addEventListener("click", () => {
  const roomID = Math.random().toString(36).slice(-8);
  roomInput.value = roomID;
});

document.getElementById("joinButton")?.addEventListener("click", () => {
  const roomID = roomInput.value ?? "";
  chrome.storage.local.set({ roomID: roomID });

  chrome.runtime.sendMessage<JoinRequest, JoinResponse>(
    { type: "join", roomID: roomID } as JoinRequest,
    (response) => {
      console.log(response);
    }
  );
});
