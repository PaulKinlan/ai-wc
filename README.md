# AI Web Component Suite

A collection of web components designed to bring on-device AI capabilities to your websites and applications.

## Project Structure

- `packages/`: Contains the individual web component packages.
  - `ai-example-component/`: An example component to demonstrate the setup.
- `examples/`: Contains example HTML files to showcase component usage.
- `docs/`: Will contain the documentation for the components.

## Getting Started

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Build Components:**
    To build a specific component (e.g., `ai-example-component`):

    ```bash
    npm run build --workspace=@ai-wc/example-component
    ```

    To build all components:

    ```bash
    npm run build --workspaces
    ```

3.  **Run Examples:**

    **Option 1: Simple Static Server (Recommended for quick checks)**
    The `examples/main.ts` is configured to load the built component using a relative path.

    - Ensure your components are built (e.g., `npm run build --workspace=@ai-wc/example-component`).
    - From the root directory of the project, run a simple HTTP server:
      ```bash
      npx serve .
      ```
    - Open your browser and navigate to `http://localhost:3000/examples/` (the port might vary if 3000 is in use).

    **Option 2: Using Vite for a Development Server (Recommended for active example development)**
    This provides hot module replacement and a better development experience.

    - Create a `vite.config.ts` in the `examples` directory:

      ```typescript
      // examples/vite.config.ts
      import { defineConfig } from "vite";

      export default defineConfig({
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
            // '@ai-wc/example-component': path.resolve(__dirname, '../packages/ai-example-component/src/ai-example-component.ts')
          },
        },
      });
      ```

    - Add Vite as a dev dependency if you haven't already at the root: `npm install --save-dev vite` (already done).
    - Add a script to your root `package.json`:
      ```json
      "scripts": {
        // ... other scripts
        "examples:dev": "vite examples"
      }
      ```
    - Run `npm run examples:dev` from the root directory.
    - Open the provided URL in your browser.
      _(Note: For this Vite setup to work seamlessly with HMR for the component itself, you might need to adjust the import in `examples/main.ts` back to `'@ai-wc/example-component'` and ensure Vite's `resolve.alias` correctly points to the component's source or that the component is rebuilt on changes.)_

## Development

- **Linting:**
  ```bash
  npm run lint
  ```

## Contributing

(Details to be added)

## License

(Details to be added)
