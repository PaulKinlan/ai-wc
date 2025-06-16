const validTypes = ["key-points", "tldr", "teaser", "headline"];
const validFormats = ["markdown", "plain-text"];
const validLengths = ["short", "medium", "long"];

class SummarizeComponent extends HTMLElement {
  static observedAttributes = ["watch", "type", "format", "length"];
  static formAssociated = true;
  #internals;
  #watchedElement;
  #sumarizer;
  #type = "key-points"; // Default type
  #format = "markdown"; // Default format
  #length = "medium"; // Default length
  #watchedElementFunction = async (event: HTMLInputElement) => {
    const target = event.target as HTMLInputElement;

    const summary = await this.#sumarizer.summarize(target.value);
    const inputElement = this.shadowRoot.querySelector("#inp");
    inputElement.value = summary;

    this.#internals.setFormValue(summary);
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

      const inputElement = this.shadowRoot.querySelector("#inp");
      const buttonElement = this.shadowRoot.querySelector("#btn");

      if ("Summarizer" in self == false) {
        // The Summarizer API is supported.
        buttonElement?.setAttribute("disabled", "true");
      }

      Summarizer.create({
        type: this.#type,
        format: this.#format,
        length: this.#length,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
          });
        },
      }).then((sumarizer) => {
        this.#sumarizer = sumarizer;
        console.log("Summarizer initialized");
      });

      buttonElement?.addEventListener("click", () => {
        const inputValue = inputElement?.value || "";
        if (inputValue) {
          this.#internals.setFormValue(inputValue);
          console.log("Summarizing:", inputValue);
          // Here you would typically call an AI service to summarize the input.
          // For demonstration, we'll just log it.
        }
      });
      inputElement?.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        this.#internals.setFormValue(target.value);
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "watch") {
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
        }
      } else {
        console.warn(
          `No form associated with this component. Unable to watch changes to ${newValue}`
        );
      }
    } else if (name === "type") {
      if (!validTypes.includes(newValue)) {
        console.warn(
          `Invalid type: ${newValue}. Valid types are: ${validTypes.join(", ")}`
        );
        return;
      }
      this.#type = newValue;
      console.log(`Attribute 'type' changed to ${newValue}`);
    } else if (name === "format") {
      if (!validFormats.includes(newValue)) {
        console.warn(
          `Invalid format: ${newValue}. Valid formats are: ${validFormats.join(", ")}`
        );
        return;
      }
      this.#format = newValue;
      console.log(`Attribute 'format' changed to ${newValue}`);
    } else if (name === "length") {
      if (!validLengths.includes(newValue)) {
        console.warn(
          `Invalid length: ${newValue}. Valid lengths are: ${validLengths.join(", ")}`
        );
        return;
      }
      this.#length = newValue;
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

  formStateRestoreCallback(state, reason) {
    const inputElement = this.shadowRoot?.querySelector(
      "#inp"
    ) as HTMLInputElement;
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
