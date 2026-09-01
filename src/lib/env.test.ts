import { describe, expect, it } from "vitest";
import { normalizeMongoUrl } from "./env";

describe("normalizeMongoUrl", () => {
  it("inserts zendenlog when the path is missing", () => {
    expect(
      normalizeMongoUrl(
        "mongodb+srv://user:pass@zen.abc.mongodb.net/?retryWrites=true&w=majority",
      ),
    ).toBe("mongodb+srv://user:pass@zen.abc.mongodb.net/zendenlog?retryWrites=true&w=majority");
  });

  it("strips wrapping quotes", () => {
    expect(normalizeMongoUrl('"mongodb://localhost:27017/zendenlog"')).toBe(
      "mongodb://localhost:27017/zendenlog",
    );
  });
});
