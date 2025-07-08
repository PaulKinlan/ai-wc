import { defineConfig } from "vite";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    sourcemap: "inline", // Enable sourcemaps for easier debugging
    lib: {
      entry: resolve(__dirname, "src/translate-component.ts"),
      name: "AiTranslateComponent",
      fileName: (format: string) => `translate-component.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
