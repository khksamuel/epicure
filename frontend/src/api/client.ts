const API_BASE = (import.meta.env.VITE_API_BASE_URL || window.KITCHEN_COMPASS_API || "").replace(
  /\/$/,
  "",
);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json();
}

export const epicureApi = {
  ingredients: () => request("/v1/models/cooc/ingredients"),
  neighbors: (ingredient, k = 5) =>
    request(`/v1/models/cooc/neighbors/${encodeURIComponent(ingredient)}?k=${k}`),
  compareNeighbors: (ingredient) =>
    request("/v1/compare/neighbors", {
      method: "POST",
      body: JSON.stringify({ ingredient, k: 5, models: ["cooc", "core", "chem"] }),
    }),
  directions: () => request("/v1/models/cooc/poles?prefix=cuisine:"),
  modes: (ingredient) =>
    request(`/v1/models/core/modes/closest/${encodeURIComponent(ingredient)}?kind=factor&k=3`),
  slerp: (payload) =>
    request(`/v1/models/${payload.model}/slerp`, {
      method: "POST",
      body: JSON.stringify({
        seed: payload.ingredient,
        direction: payload.direction,
        theta_deg: Number(payload.angle),
        k: 5,
        exclude_seed: true,
      }),
    }),
  recipeIdeas: (payload) =>
    request("/v1/creative/recipe-ideas", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
