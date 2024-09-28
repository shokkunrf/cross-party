import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Cross Party",
  version: "0.0.3",
  description: "Watch PrimeVideo with friends🎉🎉🎉",
  permissions: ["scripting", "storage", "tabs"],
  host_permissions: ["https://www.amazon.co.jp/"],
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
