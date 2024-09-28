/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BROKER_URL: string;
  readonly VITE_BROKER_USERNAME: string;
  readonly VITE_BROKER_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type ConnectionCheckRequest = { type: "connect" };
type ConnectionCheckResponse = { isConnected: bool };
type JoinRequest = { type: "join"; roomID: string };
type JoinResponse = ConnectionCheckResponse;
type PlayRequest = { type: "play" };
type PauseRequest = { type: "pause" };
type SeekRequest = { type: "seek"; time: number };
