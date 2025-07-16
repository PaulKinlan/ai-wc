import "@ai-wc/example-component";
import "@ai-wc/summarize-component";
import "@ai-wc/date-input";
import { SummarizeComponent } from "@ai-wc/summarize-component";
import { TranslateComponent } from "@ai-wc/translate-paragraph";
import { AiImageInput } from "@ai-wc/ai-image-input";

console.log(
  "Example main.ts loaded. ai-summarize-component should be available."
);

onload = () => {
  const a: AiImageInput = document.querySelector(
    "ai-image-input"
  ) as AiImageInput;
  if (a) {
    console.log("ai-image-input component found:", a);
  } else {
    console.error("ai-image-input component not found.");
  }
  const configForm = document.querySelector("#configForm") as HTMLFormElement;
  const configurableSummarize = document.querySelector(
    "#configurableSummarize"
  ) as SummarizeComponent;

  const validTypesSelect = document.querySelector(
    "#typeSelect"
  ) as HTMLSelectElement;
  const validFormatsSelect = document.querySelector(
    "#formatSelect"
  ) as HTMLSelectElement;
  const validLengthsSelect = document.querySelector(
    "#lengthsSelect"
  ) as HTMLSelectElement;

  validFormatsSelect.addEventListener("change", (event) => {
    const selectedFormat = (event.target as HTMLSelectElement).value;
    console.log(`Selected format: ${selectedFormat}`);
    configurableSummarize.setAttribute("format", selectedFormat);
  });

  validLengthsSelect.addEventListener("change", (event) => {
    const selectedLength = (event.target as HTMLSelectElement).value;
    console.log(`Selected length: ${selectedLength}`);
    configurableSummarize.setAttribute("length", selectedLength);
  });

  validTypesSelect.addEventListener("change", (event) => {
    const selectedType = (event.target as HTMLSelectElement).value;
    console.log(`Selected type: ${selectedType}`);
    configurableSummarize.setAttribute("type", selectedType);
  });

  if (
    configForm &&
    configurableSummarize &&
    validTypesSelect &&
    validFormatsSelect &&
    validLengthsSelect
  ) {
    configForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const type = validTypesSelect.value;
      const format = validFormatsSelect.value;
      const length = validLengthsSelect.value;

      configurableSummarize.setAttribute("type", type);
      configurableSummarize.setAttribute("format", format);
      configurableSummarize.setAttribute("length", length);

      console.log(
        `Updated summarize component with type: ${type}, format: ${format}, length: ${length}`
      );
    });

    const translateDemo = document.getElementById(
      "translate-1"
    ) as TranslateComponent;
    console.log("Translate component initialized");
  } else {
    console.error("One or more elements not found in the DOM.");
  }
};
