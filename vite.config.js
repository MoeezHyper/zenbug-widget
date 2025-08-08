import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  define: {
    "process.env": {}, // fixes process undefined error
  },
  plugins: [react(), tailwindcss(), cssInjectedByJsPlugin()],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: "src/embed-widget.jsx",
      name: "ZenBugWidget",
      fileName: "zenbug",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "zenbug.js",
      },
    },
  },
});
