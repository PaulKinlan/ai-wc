import { defineConfig } from "vite";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    sourcemap: "inline", // Enable sourcemaps for easier debugging
    lib: {
      entry: resolve(__dirname, "src/summarize-component.ts"),
      name: "AiSummarizeComponent",
      fileName: (format: string) => `summarize-component.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
