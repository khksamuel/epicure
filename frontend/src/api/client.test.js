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
});
