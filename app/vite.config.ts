import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Cross Party",
  version: "1.0.0",
  description: "🥳Watch videos with friends🎉",
  permissions: ["storage", "tabs"],
  action: {
    default_popup: "src/popup/index.html",
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
