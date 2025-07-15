import { GoogleGenerativeAI } from "@google/generative-ai";

class AiImageInput extends HTMLElement {
  static formAssociated = true;

  private internals: ElementInternals;
  private inputElement: HTMLInputElement;
  private dialogElement: HTMLDialogElement;
  private promptTextElement: HTMLTextAreaElement;
  private generatedImage: string | null = null;

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            width: 150px;
            height: 150px;
          }
          #imageInput {
            width: 100%;
            height: 100%;
          }
          #promptDialog {
            width: 400px;
          }
          #prompt {
            width: 100%;
          }
        </style>
        <input type="image" id="imageInput" />
        <dialog id="promptDialog">
          <form id="promptForm">
            <h3>Generate Image with AI</h3>
            <p>Enter a prompt to generate an image.</p>
            <textarea id="prompt" name="prompt" rows="4"></textarea>
            <button type="submit">Generate</button>
            <button type="button" id="closeDialog">Close</button>
          </form>
        </dialog>
      `;

      this.inputElement = this.shadowRoot.querySelector("#imageInput") as HTMLInputElement;
      this.dialogElement = this.shadowRoot.querySelector("#promptDialog") as HTMLDialogElement;
      this.promptTextElement = this.shadowRoot.querySelector("#prompt") as HTMLTextAreaElement;

      const promptForm = this.shadowRoot.querySelector("#promptForm") as HTMLFormElement;
      const closeDialogButton = this.shadowRoot.querySelector("#closeDialog") as HTMLButtonElement;

      this.inputElement.addEventListener("keydown", this.handleKeyDown.bind(this));
      promptForm.addEventListener("submit", this.handlePromptSubmit.bind(this));
      closeDialogButton.addEventListener("click", () => this.dialogElement.close());
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      this.dialogElement.showModal();
    }
  }

  private async handlePromptSubmit(event: Event) {
    event.preventDefault();
    const prompt = this.promptTextElement.value;
    if (!prompt) {
      return;
    }

    this.dialogElement.close();
    await this.generateImage(prompt);
  }

  private async generateImage(prompt: string) {
    const apiKey = localStorage.getItem("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("Gemini API key not found in local storage.");
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" }); // Or another suitable model

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // This is a placeholder. In a real scenario, you would handle the image data from the API.
      // For now, we'll just use a placeholder image.
      this.generatedImage = `https://via.placeholder.com/150/0000FF/808080?text=${encodeURIComponent(prompt)}`;
      this.inputElement.src = this.generatedImage;
      this.internals.setFormValue(this.generatedImage);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  }

  get value() {
    return this.generatedImage || this.inputElement.src;
  }

  set value(val: string) {
    if (val) {
      this.inputElement.src = val;
      this.generatedImage = val;
      this.internals.setFormValue(val);
    }
  }
}

customElements.define("ai-image-input", AiImageInput);
