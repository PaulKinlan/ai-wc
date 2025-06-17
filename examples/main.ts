// Import the component.
// Import the component.
// This path assumes that you are serving from the root of the project.
// The component is built into 'packages/ai-example-component/dist/'
import "../packages/ai-example-component/dist/ai-example-component.es.js";

import "../packages/ai-summarize-component/dist/summarize-component.es.js";
import { SummarizeComponent } from "../packages/ai-summarize-component/dist/summarize-component.es.js";

console.log(
  "Example main.ts loaded. ai-summarize-component should be available."
);

onload = () => {
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
  } else {
    console.error("One or more elements not found in the DOM.");
  }
};
