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
  private isGenerating = false;
  private longPressTimer: number | null = null;
  private generationState: "idle" | "prompt" | "generating" | "done" | "error" =
    "idle";

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
            position: relative;
          }

          #generate-overlay {
            position: absolute;
            inset: 0;
            background: Canvas;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          #generate-preview {
            max-width: 100%;
            max-height: 100%;
          }

          :host(.generate) #generate-overlay {
            display: flex;
          }

          :host(.generate) #fileInput, :host(.generate) slot {
            visibility: hidden;
          }

          #promptDialog {
            width: 400px;
          }
          #prompt {
            width: 100%;
          }
        </style>
        <input type="file" id="fileInput" accept="image/*" />
        <slot></slot>
        <div id="generate-overlay">
          <div id="generate-text">Generate image</div>
          <div id="generate-progress" style="display: none">
            Generating, please wait...
          </div>
          <img id="generate-preview" style="display: none" />
          <div id="generate-error" style="display: none">
            Error generating image. Please try again.
          </div>
        </div>
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

  connectedCallback() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
    this.addEventListener("touchstart", this.handleTouchStart.bind(this));
    this.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
    this.removeEventListener("touchstart", this.handleTouchStart.bind(this));
    this.removeEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey) {
      this.isGenerating = true;
      this.updateState("prompt");
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (!event.altKey && !event.ctrlKey) {
      this.isGenerating = false;
      if (this.generationState === "prompt" && !this.dialogElement.open) {
        this.updateState("idle");
      }
    }
  }

  private handleTouchStart(event: TouchEvent) {
    this.longPressTimer = window.setTimeout(() => {
      this.isGenerating = true;
      this.classList.add("generate");
      this.longPressTimer = null;
    }, 500);
  }

  private handleTouchEnd(event: TouchEvent) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // A small delay to allow the click to register.
    setTimeout(() => {
      this.isGenerating = false;
      this.classList.remove("generate");
    }, 200);
  }

  private handleFileSelection(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.internals.setFormValue(file);
    }
  }

  private handleHostClick(event: MouseEvent) {
    if (this.isGenerating) {
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
    this.updateState("generating");
    await this.generateImage(prompt);
  }

  private updateState(state: AiImageInput["generationState"]) {
    this.generationState = state;

    const generateText = this.shadowRoot?.querySelector(
      "#generate-text"
    ) as HTMLElement;
    const generateProgress = this.shadowRoot?.querySelector(
      "#generate-progress"
    ) as HTMLElement;
    const generatePreview = this.shadowRoot?.querySelector(
      "#generate-preview"
    ) as HTMLImageElement;
    const generateError = this.shadowRoot?.querySelector(
      "#generate-error"
    ) as HTMLElement;

    generateText.style.display = "none";
    generateProgress.style.display = "none";
    generatePreview.style.display = "none";
    generateError.style.display = "none";

    switch (state) {
      case "idle":
        this.classList.remove("generate");
        generateText.style.display = "block";
        break;
      case "prompt":
        this.classList.add("generate");
        generateText.style.display = "block";
        break;
      case "generating":
        this.classList.add("generate");
        generateProgress.style.display = "block";
        break;
      case "done":
        this.classList.add("generate");
        generatePreview.style.display = "block";
        break;
      case "error":
        this.classList.add("generate");
        generateError.style.display = "block";
        break;
    }
  }

  private async generateImage(prompt: string) {
    const apiKey = localStorage.getItem("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("Gemini API key not found in local storage.");
      this.updateState("error");
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

      if (response?.generatedImages) {
        for (let i = 0; i < response.generatedImages.length; i++) {
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

          const previewUrl = URL.createObjectURL(blob);
          const generatePreview = this.shadowRoot?.querySelector(
            "#generate-preview"
          ) as HTMLImageElement;
          generatePreview.src = previewUrl;

          this.updateState("done");

          break;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      this.updateState("error");
    }
  }

  get value() {
    return this.generatedImage;
  }
}

customElements.define("ai-image-input", AiImageInput);

export { AiImageInput };
