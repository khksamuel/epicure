export function humanName(value) {
  return value
    .replace(/^cuisine:|^taste:/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normaliseIngredient(value) {
  return value.trim().toLowerCase().replaceAll(" ", "_");
}

export function scoreText(value) {
  return `${Math.round(Math.max(0, value) * 100)}% close`;
}
