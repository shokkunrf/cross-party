import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import { primevideoUrls } from "./src/config/target-host";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Cross Party",
  version: "0.0.4",
  description: "Watch PrimeVideo with friends🎉🎉🎉",
  permissions: ["scripting", "storage", "tabs"],
  host_permissions: primevideoUrls,
  icons: {
    128: "src/icon.png",
  },
  action: {
    default_popup: "src/popup/index.html",
    default_icon: {
      128: "src/icon.png",
    },
  },
  background: {
    service_worker: "src/background/main.ts",
  },
});

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
