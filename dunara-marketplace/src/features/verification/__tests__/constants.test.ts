import { describe, it, expect } from "vitest";
import {
  ALLOWED_MIME,
  MAX_FILES,
  MAX_FILE_BYTES,
  extensionForMime,
} from "../lib/constants";

describe("verification upload rules", () => {
  it("allows only pdf/jpeg/png", () => {
    expect(ALLOWED_MIME).toContain("application/pdf");
    expect(ALLOWED_MIME).toContain("image/jpeg");
    expect(ALLOWED_MIME).toContain("image/png");
    expect(ALLOWED_MIME).not.toContain("image/gif");
  });

  it("maps extensions", () => {
    expect(extensionForMime("image/jpeg")).toBe("jpg");
    expect(extensionForMime("application/pdf")).toBe("pdf");
    expect(extensionForMime("text/plain")).toBeNull();
  });

  it("limits size and count", () => {
    expect(MAX_FILES).toBe(5);
    expect(MAX_FILE_BYTES).toBe(1024 * 1024);
  });
});
