import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
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
  define: {
    "process.env": "{}",
    "import.meta.env": "{}",
  },
});
