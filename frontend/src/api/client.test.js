import { afterEach, describe, expect, it, vi } from "vitest";
import { epicureApi } from "./client";

describe("epicureApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses the same-origin API contract for SLERP requests", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await epicureApi.slerp({
      model: "core",
      ingredient: "rice",
      direction: "cuisine:South_Asian",
      angle: "30",
    });

    expect(fetch).toHaveBeenCalledWith(
      "/v1/models/core/slerp",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          seed: "rice",
          direction: "cuisine:South_Asian",
          theta_deg: 30,
          k: 5,
          exclude_seed: true,
        }),
      }),
    );
  });

  it("requests the complete ingredient vocabulary without a client-side limit", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ["miso", "rice"],
    });

    await expect(epicureApi.ingredients()).resolves.toEqual(["miso", "rice"]);
    expect(fetch).toHaveBeenCalledWith("/v1/models/cooc/ingredients", expect.anything());
  });

  it("uses the documented routes for the remaining model operations", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await Promise.all([
      epicureApi.neighbors("salt & pepper", 3),
      epicureApi.compareNeighbors("apple"),
      epicureApi.directions(),
      epicureApi.modes("spring onion"),
      epicureApi.recipeIdeas({ title: "Soup", ingredients: ["onion"] }),
    ]);

    expect(fetch).toHaveBeenCalledWith(
      "/v1/models/cooc/neighbors/salt%20%26%20pepper?k=3",
      expect.anything(),
    );
    expect(fetch).toHaveBeenCalledWith(
      "/v1/compare/neighbors",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetch).toHaveBeenCalledWith("/v1/models/cooc/poles?prefix=cuisine:", expect.anything());
    expect(fetch).toHaveBeenCalledWith(
      "/v1/models/core/modes/closest/spring%20onion?kind=factor&k=3",
      expect.anything(),
    );
    expect(fetch).toHaveBeenCalledWith(
      "/v1/creative/recipe-ideas",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Soup", ingredients: ["onion"] }),
      }),
    );
  });

  it("surfaces failed API responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 503 });

    await expect(epicureApi.directions()).rejects.toThrow("Request failed with status 503");
  });
});
