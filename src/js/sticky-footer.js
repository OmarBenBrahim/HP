import { createFragment } from "./dom-helpers.js";
import { renderTemplate } from "./template-engine.js";

export function renderStickyFooter(rootElement, template, footerData) {
  rootElement.innerHTML = "";
  rootElement.append(createFragment(renderTemplate(template, footerData)));

  const closeButton = rootElement.querySelector(".sticky-footer__close");

  if (!closeButton) {
    return;
  }

  closeButton.addEventListener("click", () => {
    rootElement.innerHTML = "";
  });
}
