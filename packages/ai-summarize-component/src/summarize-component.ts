/// <reference lib="dom" />

const validTypes = ["key-points", "tldr", "teaser", "headline"];
const validFormats = ["markdown", "plain-text"];
const validLengths = ["short", "medium", "long"];

class SummarizeComponent extends HTMLElement {
  static observedAttributes = ["watch", "type", "format", "length"];
  static formAssociated = true;
  #internals;
  #watchedElement: HTMLInputElement | null;
  #summarizer: Summarizer | null = null;
  #type: SummarizerType = "key-points"; // Default type
  #format: SummarizerFormat = "markdown"; // Default format
  #length: SummarizerLength = "medium"; // Default length
  #initializeSummarizer = async () => {
    if (this.#summarizer) {
      this.#summarizer.destroy();
    }
    this.#summarizer = await Summarizer.create({
      type: this.#type,
      format: this.#format,
      length: this.#length,
      monitor(m) {
        m.addEventListener("downloadprogress", (e: ProgressEvent) => {
          if (e.lengthComputable) {
            console.log(`Downloaded ${(e.loaded / e.total) * 100}%`);
          } else {
            console.log(`Downloaded ${e.loaded} bytes`);
          }
        });
      },
    });
  };

  #summarize = async (value) => {
    if (!this.#summarizer) {
      console.warn("Summarizer not initialized yet.");
      return;
    }
    const summary = await this.#summarizer.summarize(value);
    const inputElement = this.shadowRoot?.querySelector(
      "#inp"
    ) as HTMLInputElement | null;
    if (inputElement) {
      inputElement.value = summary;
    }

    this.#internals.setFormValue(summary);
  };
  #watchedElementFunction = async (event: Event) => {
    const target = event.target as HTMLInputElement;

    await this.#summarize(target.value);

    console.log(`Watched element changed: ${target.value}`);
  };
  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#watchedElement = null;

    this.attachShadow({ mode: "open", delegatesFocus: true });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: flex;
            flex-direction: row;
            border: 1px solid gray;
            padding: 16px;
            color: black; /* Default text color */
          }
          button:disabled {
            display: none;}
        </style>
        <input type=text value="" id="inp"/>
        <button id="btn">S</button>
      `;

      const inputElement = this.shadowRoot.querySelector(
        "#inp"
      ) as HTMLInputElement | null;
      const buttonElement = this.shadowRoot.querySelector("#btn");

      if (!("Summarizer" in window) || !window.Summarizer) {
        // The Summarizer API is not supported or not available.
        console.warn("Summarizer API not found.");
        buttonElement?.setAttribute("disabled", "true");
      } else {
        // TODO:// We should move this because we might need to set it up if the parameters have changed.
        this.#initializeSummarizer();
      }

      buttonElement?.addEventListener("click", async () => {
        const watchedElement = this.#watchedElement;
        if (watchedElement) {
          await this.#summarize(watchedElement.value);
        }
      });
      inputElement?.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        this.#internals.setFormValue(target.value);
      });
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === "watch" && newValue) {
      console.log(`Attribute 'watch' changed from ${oldValue} to ${newValue}`);
      //
      const form = this.#internals.form;
      let watchedElement = this.#watchedElement;
      if (form) {
        if (watchedElement) {
          watchedElement.removeEventListener(
            "change",
            this.#watchedElementFunction
          );
        }
        watchedElement = form.querySelector(`#${newValue}`);
        if (!watchedElement) {
          console.warn(`Element with id ${newValue} not found in form.`);
          return;
        }
        if (watchedElement) {
          watchedElement.addEventListener(
            "change",
            this.#watchedElementFunction
          );
          this.#watchedElement = watchedElement as HTMLInputElement;
        }
      } else {
        console.warn(
          `No form associated with this component. Unable to watch changes to ${newValue}`
        );
      }
    } else if (name === "type") {
      if (newValue === null || !validTypes.includes(newValue)) {
        console.warn(
          `Invalid type: ${newValue}. Valid types are: ${validTypes.join(", ")}`
        );
        return;
      }
      this.#type = newValue;
      this.#initializeSummarizer();
      console.log(`Attribute 'type' changed to ${newValue}`);
    } else if (name === "format") {
      if (newValue === null || !validFormats.includes(newValue)) {
        console.warn(
          `Invalid format: ${newValue}. Valid formats are: ${validFormats.join(", ")}`
        );
        return;
      }
      this.#format = newValue;
      this.#initializeSummarizer();
      console.log(`Attribute 'format' changed to ${newValue}`);
    } else if (name === "length") {
      if (newValue === null || !validLengths.includes(newValue)) {
        console.warn(
          `Invalid length: ${newValue}. Valid lengths are: ${validLengths.join(", ")}`
        );
        return;
      }
      this.#length = newValue;
      this.#initializeSummarizer();
      console.log(`Attribute 'length' changed to ${newValue}`);
    }

    console.log(`Attribute ${name} has changed.`);
  }

  formResetCallback() {
    console.log("Form reset called on ai-summarize-component");
    const inputElement = this.shadowRoot?.querySelector(
      "#inp"
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
      this.#internals.setFormValue("");
    }
  }

  formStateRestoreCallback(state: string, reason: "autocomplete" | "restore") {
    const inputElement = this.shadowRoot?.querySelector(
      "#inp"
    ) as HTMLInputElement | null;
    if (inputElement) {
      inputElement.value = state;
      this.#internals.setFormValue(state);
    }
  }

  connectedCallback() {
    console.log("ai-summarize-component connected!");
  }
}

customElements.define("ai-summarize-component", SummarizeComponent);

export { SummarizeComponent };
