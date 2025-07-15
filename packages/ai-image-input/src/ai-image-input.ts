import { GoogleGenAI } from "@google/genai";
function base64ToBlob(base64: string, contentType: string = ""): Blob {
  // Split the Base64 string into two parts: the metadata and the data
  const byteCharacters = atob(base64.split(",")[1] || base64);

  // Create an array of byte codes
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  // Convert the byte codes into a Uint8Array
  const byteArray = new Uint8Array(byteNumbers);

  // Create a Blob from the Uint8Array
  return new Blob([byteArray], { type: contentType });
}

class AiImageInput extends HTMLElement {
  static formAssociated = true;

  private internals: ElementInternals;
  private fileInputElement!: HTMLInputElement;
  private dialogElement!: HTMLDialogElement;
  private promptTextElement!: HTMLTextAreaElement;
  private generatedImage: string | null = null;

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          #promptDialog {
            width: 400px;
          }
          #prompt {
            width: 100%;
          }
        </style>
        <input type="file" id="fileInput" accept="image/*" />
        <slot></slot>
        <dialog id="promptDialog">
          <h3>Generate Image with AI</h3>
          <p>Enter a prompt to generate an image.</p>
          <textarea id="prompt" name="prompt" rows="4"></textarea>
          <button type="button" id="submit">Generate</button>
          <button type="button" id="closeDialog">Close</button>
        </dialog>
      `;

      this.fileInputElement = this.shadowRoot.querySelector(
        "#fileInput"
      ) as HTMLInputElement;
      this.dialogElement = this.shadowRoot.querySelector(
        "#promptDialog"
      ) as HTMLDialogElement;
      this.promptTextElement = this.shadowRoot.querySelector(
        "#prompt"
      ) as HTMLTextAreaElement;

      const submitButton = this.shadowRoot.querySelector(
        "#submit"
      ) as HTMLButtonElement;
      const closeDialogButton = this.shadowRoot.querySelector(
        "#closeDialog"
      ) as HTMLButtonElement;

      this.addEventListener("click", this.handleHostClick.bind(this));
      this.fileInputElement.addEventListener(
        "change",
        this.handleFileSelection.bind(this)
      );
      submitButton.addEventListener(
        "click",
        this.handlePromptSubmit.bind(this)
      );
      closeDialogButton.addEventListener("click", () =>
        this.dialogElement.close()
      );
    }
  }

  private handleFileSelection(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.internals.setFormValue(result);
      };
      reader.readAsDataURL(file);
    }
  }

  private handleHostClick(event: MouseEvent) {
    if (event.altKey) {
      event.preventDefault();
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

    const genAI = new GoogleGenAI({ apiKey });

    try {
      const response = await genAI.models.generateImages({
        model: "models/imagen-4.0-generate-preview-06-06",
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "1:1",
        },
      });

      // This is a placeholder. In a real scenario, you would handle the image data from the API.
      // For now, we'll just use a placeholder image.
      for (let i = 0; i < response?.generatedImages?.length; i++) {
        if (!response.generatedImages?.[i]?.image?.imageBytes) {
          continue;
        }
        const fileName = `image_${i}.jpeg`;
        const { image } = response?.generatedImages[i];
        if (!image || !image.imageBytes) {
          console.error("No image data found in the response.");
          continue;
        }

        const { imageBytes, mimeType } = image;
        const blob = base64ToBlob(imageBytes, mimeType);
        const file = new File([blob], fileName, { type: mimeType });

        this.internals.setFormValue(file);

        break;
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }
  }

  get value() {
    return this.generatedImage;
  }
}

customElements.define("ai-image-input", AiImageInput);

export { AiImageInput };
