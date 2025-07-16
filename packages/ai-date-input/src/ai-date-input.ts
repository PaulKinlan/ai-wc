import * as chrono from "chrono-node";

class AiDateInput extends HTMLElement {
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
        <input type="date" />
        <button>Set Date</button>
      `;
    }
  }

  connectedCallback() {
    const button = this.shadowRoot?.querySelector("button");
    const dateInput = this.shadowRoot?.querySelector("input");

    button?.addEventListener("click", () => {
      const dateString = prompt("Enter a date (e.g., next week, June 3):");
      if (dateString) {
        const parsedDate = chrono.parseDate(dateString);
        if (parsedDate && dateInput) {
          const year = parsedDate.getFullYear();
          const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
          const day = parsedDate.getDate().toString().padStart(2, '0');
          dateInput.value = `${year}-${month}-${day}`;
        } else {
          alert("Could not parse date");
        }
      }
    });
  }
}

customElements.define("ai-date-input", AiDateInput);
