import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AI Web Components",
  description: "Documentation for AI Web Components",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Components", link: "/components/getting-started" }, // Example link
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting Started", link: "/introduction/getting-started" },
        ],
      },
      {
        text: "Components",
        items: [
          {
            text: "AI Example Component",
            link: "/components/ai-example-component",
          },
          // Add more components here
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/your-username/ai-wc" }, // Replace with your repo
    ],
  },
});
