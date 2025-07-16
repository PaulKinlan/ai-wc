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
      this.tabIndex = 0;
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            border: 1px solid gray;
            padding: 16px;
            color: black; /* Default text color */
          }

          #date-popover {
            border: 1px solid black;
            padding: 8px;
            background: white;
            margin: 0;
            inset: unset;
            bottom: anchor(top);
            left: anchor(left);
          }

          #date-popover:popover-open {
            display: block;
          }
        </style>
        <input type="date" id="date-input" />
        <div id="date-popover" popover="manual" anchor="date-input">
          <input type="text" id="date-text-input" />
        </div>
      `;
    }
  }

  connectedCallback() {
    const dateInput = this.shadowRoot?.querySelector(
      "#date-input"
    ) as HTMLInputElement;
    const popover = this.shadowRoot?.querySelector(
      "#date-popover"
    ) as HTMLElement;
    const dateTextInput = this.shadowRoot?.querySelector(
      "#date-text-input"
    ) as HTMLInputElement;

    const openPopover = () => {
      if (this.hasAttribute("disabled") || this.hasAttribute("readonly")) {
        return;
      }
      popover.showPopover();
      dateTextInput.focus();
    };

    const closePopover = () => {
      popover.hidePopover();
    };

    const setDate = () => {
      const dateString = dateTextInput.value;
      if (dateString) {
        const parsedDate = chrono.parseDate(dateString);
        if (parsedDate && dateInput) {
          const year = parsedDate.getFullYear();
          const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
          const day = parsedDate.getDate().toString().padStart(2, "0");
          const dateValue = `${year}-${month}-${day}`;
          dateInput.value = dateValue;
          this.internals.setFormValue(dateValue);
        } else {
          alert("Could not parse date");
        }
      }
      dateTextInput.value = "";
      closePopover();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        e.preventDefault();
        openPopover();
      }
    };

    this.addEventListener("keydown", handleKeyDown);

    dateInput.addEventListener("mouseenter", () => {
      document.addEventListener("keydown", handleKeyDown);
    });

    dateInput.addEventListener("mouseleave", () => {
      document.removeEventListener("keydown", handleKeyDown);
    });

    let touchTimer: number;
    this.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        touchTimer = window.setTimeout(() => {
          openPopover();
        }, 500);
      },
      { passive: true }
    );

    this.addEventListener("touchend", () => {
      clearTimeout(touchTimer);
    });

    this.addEventListener("touchmove", () => {
      clearTimeout(touchTimer);
    });

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt" || e.key === "Control") {
        // If the popover is open and the text input is empty, close the popover.
        // This allows the user to release the key to close the popover if they haven't typed.
        if (popover.matches(":popover-open") && dateTextInput.value === "") {
          closePopover();
        }
      }
    };

    // Listen on the document to catch the keyup event even if focus has moved.
    document.addEventListener("keyup", handleKeyUp);

    dateTextInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        setDate();
      } else if (e.key === "Escape") {
        closePopover();
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

  formStateRestoreCallback(
    state: string | File | FormData | null,
    mode: "restore" | "autocomplete"
  ) {
    const dateInput = this.shadowRoot?.querySelector("input");
    if (dateInput && typeof state === "string") {
      dateInput.value = state;
      this.internals.setFormValue(state);
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === "disabled") {
      this.formDisabledCallback(newValue !== null);
    }
  }
}

customElements.define("ai-date-input", AiDateInput);
