/// <reference lib="dom" />

class TranslateComponent extends HTMLElement {
  static observedAttributes = ["lang", "target-language"];

  #translateButton: HTMLAnchorElement | null = null;
  #inputText: HTMLSlotElement | null = null;
  #outputText: HTMLParagraphElement | null = null;

  #sourceLanguage: string = "en";
  #targetLanguage: string | null = null;

  #translator: Translator | null = null;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
      <style>
        #output {
          display:none;

          &.visible {
            display: block;
          }
        }

        #translate[disabled] {
          display: none;
        }
      </style>
      <p><slot></slot></p>
      <a id="translate" href="#translate">Translate</a>
      <p id="output"></p>`;

      this.#translateButton = this.shadowRoot.querySelector("#translate");
      this.#outputText = this.shadowRoot.querySelector("#output");
      this.#inputText = this.shadowRoot.querySelector("slot");

      this.#determineSourceLanguage().then((lang) => {
        console.log("Source language determined:", lang);
        this.#sourceLanguage = lang;
      });

      this.#targetLanguage = this.getAttribute("target-language");

      if (!("Translator" in window) || !window.Translator) {
        // The Translator API is not supported or not available.
        console.warn("Translate API not found.");
        this.#translateButton?.setAttribute("disabled", "true");
      }

      if (!this.#targetLanguage == undefined) {
        console.warn("No target language specified");
        this.#translateButton?.setAttribute("disabled", "true");
      }
    }

    this.#translateButton?.addEventListener("click", async () => {
      // If a specific element is being watched, summarize its content
      this.#outputText?.classList.add("show");
      this.#translateText();
    });
  }

  #convertLanguageCodeToBcp47(languageCode: string): string {
    // Convert language code to BCP 47 format if necessary
    return languageCode.toLowerCase().split("-")[0];
  }

  /*
    * Determines the source language for translation.
    * If `lang` attribute is not defined on the component, then recursively checks the parent elements up to the html element.
    * If no `lang` attribute is found, use `navigator.language`

  */
  async #determineSourceLanguage() {
    let sourceLanguage = this.getAttribute("lang");
    if (!sourceLanguage) {
      let parent = this.parentElement;
      while (parent && !sourceLanguage) {
        sourceLanguage = parent.getAttribute("lang");
        parent = parent.parentElement;
      }
      if (!sourceLanguage) {
        sourceLanguage =
          this.#convertLanguageCodeToBcp47(navigator.language) || "en";

        const elementText = this.textContent?.trim();

        if (elementText && elementText.length > 0) {
          const langDetector = await LanguageDetector.create({});
          const languages = await langDetector.detect(elementText);
          if (languages && languages.length > 0) {
            sourceLanguage = languages[0].detectedLanguage || "en"; // Default to English if no language is detected
          }
        }
      }
    }
    return sourceLanguage;
  }

  async #determineTargetLanguage() {
    let targetLanguage =
      this.getAttribute("target-language") ||
      this.#convertLanguageCodeToBcp47(navigator.language) ||
      "en";
    return targetLanguage;
  }

  async #checkAndInitialize() {
    const translateButton = this.#translateButton;
    const sourceLanguage = await this.#determineSourceLanguage();
    const targetLanguage = await this.#determineTargetLanguage();

    if (targetLanguage == null) {
      console.warn(
        "No target language specified, unable to initialize translator."
      );

      translateButton?.setAttribute("disabled", "true");
      return;
    }

    if (sourceLanguage == targetLanguage) {
      console.warn(
        `Source language (${sourceLanguage}) and target language (${targetLanguage}) are the same. Translation will not proceed.`
      );
      translateButton?.setAttribute("disabled", "true");
      return;
    }

    const translatorCapabilities = await Translator.availability({
      sourceLanguage,
      targetLanguage,
    });

    console.log("Translator capabilities:", translatorCapabilities);

    if (translatorCapabilities == "available") {
      translateButton?.removeAttribute("disabled");
    }

    if (
      translatorCapabilities == "downloadable" ||
      translatorCapabilities == "downloading"
    ) {
      console.warn(
        `Translator is ${translatorCapabilities}. Please ensure the necessary resources are available.`
      );
      return;
    }

    if (translatorCapabilities == "unavailable") {
      console.warn(
        `Translator is unavailable for the specified languages (${sourceLanguage}, ${targetLanguage}).`
      );
      translateButton?.setAttribute("disabled", "true");
      return;
    }

    try {
      const translator = await Translator.create({
        sourceLanguage,
        targetLanguage,
      });

      if (!translator) {
        console.warn("Translator could not be created.");
        translateButton?.setAttribute("disabled", "true");
        return;
      }
      this.#translator = translator;
    } catch (error) {
      console.error(
        `Error creating translator (${sourceLanguage}, ${targetLanguage}):`,
        error
      );
      translateButton?.setAttribute("disabled", "true");
      return;
    }
  }

  async #translateText() {
    let translator = this.#translator;
    const sourceLanguage = await this.#determineSourceLanguage();
    const targetLanguage = await this.#determineTargetLanguage();
    if (!targetLanguage) {
      console.warn("No target language specified for translation.");
      return;
    }

    if (!translator) {
      console.warn("Translator is not initialized.");
      this.#translator = await Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
          });
        },
      });
    }

    if (!this.#inputText || !this.#outputText) {
      console.warn("Input or output text elements are not available.");
      return;
    }

    this.#outputText.innerText = ""; // Clear previous output

    const inputNodes = this.#inputText.assignedNodes({ flatten: true });
    const inputText = inputNodes
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => (node as Text).textContent?.trim())
      .filter((text) => text && text.length > 0)
      .join(" ");

    if (!inputText) {
      console.warn("No input text to translate.");
      return;
    }

    const stream = translator.translateStreaming(inputText);

    this.#outputText.classList.add("visible");
    for await (const chunk of stream) {
      this.#outputText.innerText += chunk;
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === "lang" && newValue) {
      this.#sourceLanguage = newValue;
    }

    if (name === "target-language" && newValue) {
      this.#targetLanguage = newValue;
      this.#checkAndInitialize();
    }

    console.log(`Attribute ${name} has changed.`);
  }

  connectedCallback() {}
}

customElements.define("ai-translate-component", TranslateComponent);

export { TranslateComponent };
