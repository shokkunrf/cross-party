import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Cross Party",
  version: "0.0.2",
  description: "Watch PrimeVideo with friends🎉🎉🎉",
  permissions: ["storage", "tabs"],
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
  content_scripts: [
    {
      matches: ["https://www.amazon.co.jp/gp/video/detail/*"],
      js: ["src/content/main.ts"],
    },
  ],
});

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
