import { escapeHtml } from "./dom-helpers.js";

function resolvePath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

export function renderTemplate(template, data) {
  const withRawHtml = template.replace(/\{\{\{(.*?)\}\}\}/g, (_, rawPath) => {
    const path = rawPath.trim();
    const value = resolvePath(data, path);
    return String(value ?? "");
  });

  return withRawHtml.replace(/\{\{(.*?)\}\}/g, (_, rawPath) => {
    const path = rawPath.trim();
    const value = resolvePath(data, path);
    return escapeHtml(value ?? "");
  });
}
