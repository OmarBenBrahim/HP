export function getRequiredElement(selector, parent = document) {
  const element = parent.querySelector(selector);

  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}

export function createFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.cloneNode(true);
}

export function setElementHtml(element, html) {
  element.innerHTML = html;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function limitText(value, maxLength) {
  const input = String(value ?? "").trim();

  if (!maxLength || input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function createDetailsHtml(details) {
  return details
    .map(
      ({ label, value }) =>
        `<div class="product-summary__detail-row"><dt class="product-summary__detail-label">${escapeHtml(
          label
        )}</dt><dd class="product-summary__detail-value">${escapeHtml(
          value
        )}</dd></div>`
    )
    .join("");
}

export function createOptionsHtml(options, selectedId) {
  return options
    .map(({ id, label }) => {
      const isSelected = id === selectedId;
      const selectedClass = isSelected ? " is-selected" : "";
      const selectedState = isSelected ? "true" : "false";
      return `<li class="selector__option-item" role="presentation"><button class="selector__option js-selector-option${selectedClass}" type="button" role="option" aria-selected="${selectedState}" data-value="${escapeHtml(
        id
      )}">${escapeHtml(label)}</button></li>`;
    })
    .join("");
}
