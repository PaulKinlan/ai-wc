import { defineConfig } from "vite";
import { resolve } from "node:path"; // For path.resolve if using alias
import { fileURLToPath } from "node:url"; // For __dirname if using alias
import { dirname } from "node:path"; // For __dirname if using alias

// const __dirname = dirname(fileURLToPath(import.meta.url)); // Uncomment if using alias

export default defineConfig({
  build: { sourcemap: "inline" }, // Enable sourcemaps for easier debugging
  server: {
    port: 3001, // Or any port you prefer
  },
  resolve: {
    alias: {
      // If you want to use bare module specifiers like '@ai-wc/example-component'
      // and have Vite resolve them to the source for HMR during example dev.
      // This requires the component's dev server to also be running or for it to be pre-built.
      // For simplicity with the current setup, direct relative paths in main.ts are used.
      // If you switch main.ts to use '@ai-wc/example-component', uncomment and adjust:
      "@ai-wc/example-component": resolve(
        __dirname,
        "../packages/ai-example-component/src/ai-example-component.ts"
      ),
      "@ai-wc/summarize-component": resolve(
        __dirname,
        "../packages/ai-summarize-component/src/summarize-component.ts"
      ),
    },
  },
});
