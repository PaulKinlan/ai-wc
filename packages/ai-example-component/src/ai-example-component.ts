class AiExampleComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            border: 1px solid gray;
            padding: 16px;
            color: black; /* Default text color */
          }
        </style>
        <p>Hello from ai-example-component!</p>
      `;
    }
  }

  connectedCallback() {
    console.log("ai-example-component connected!");
  }
}

customElements.define("ai-example-component", AiExampleComponent);
