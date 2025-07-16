import * as chrono from "chrono-node";

class AiDateInput extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ["disabled", "readonly"];
  }

  private internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
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
        <input type="date" />
        <button>Set Date</button>
      `;
    }
  }

  connectedCallback() {
    const button = this.shadowRoot?.querySelector("button");
    const dateInput = this.shadowRoot?.querySelector("input");

    button?.addEventListener("click", () => {
      if (this.hasAttribute("disabled") || this.hasAttribute("readonly")) {
        return;
      }
      const dateString = prompt("Enter a date (e.g., next week, June 3):");
      if (dateString) {
        const parsedDate = chrono.parseDate(dateString);
        if (parsedDate && dateInput) {
          const year = parsedDate.getFullYear();
          const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
          const day = parsedDate.getDate().toString().padStart(2, '0');
          const dateValue = `${year}-${month}-${day}`;
          dateInput.value = dateValue;
          this.internals.setFormValue(dateValue);
        } else {
          alert("Could not parse date");
        }
      }
    });
  }

  formAssociatedCallback(form: HTMLFormElement | null) {
    console.log("formAssociatedCallback", form);
  }

  formDisabledCallback(disabled: boolean) {
    const button = this.shadowRoot?.querySelector("button");
    const dateInput = this.shadowRoot?.querySelector("input");
    if (button) {
      (button as HTMLButtonElement).disabled = disabled;
    }
    if (dateInput) {
      (dateInput as HTMLInputElement).disabled = disabled;
    }
  }

  formResetCallback() {
    const dateInput = this.shadowRoot?.querySelector("input");
    if (dateInput) {
      dateInput.value = "";
    }
    this.internals.setFormValue("");
  }

  formStateRestoreCallback(state: string | File | FormData | null, mode: "restore" | "autocomplete") {
    const dateInput = this.shadowRoot?.querySelector("input");
    if (dateInput && typeof state === "string") {
      dateInput.value = state;
      this.internals.setFormValue(state);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "disabled") {
      this.formDisabledCallback(newValue !== null);
    }
  }
}

customElements.define("ai-date-input", AiDateInput);
