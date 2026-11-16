import { describe, expect, it } from "vitest";
import {
  ALLOWED_DOC_MIME,
  MAX_DOC_BYTES,
  LEVEL_LABELS,
  STATUS_LABELS,
} from "@/features/verification/lib/types";

describe("verification rules", () => {
  it("allows only pdf and common image MIME types", () => {
    expect(ALLOWED_DOC_MIME).toContain("application/pdf");
    expect(ALLOWED_DOC_MIME).toContain("image/jpeg");
    expect(ALLOWED_DOC_MIME).not.toContain("application/zip");
  });

  it("caps documents at 10 MiB", () => {
    expect(MAX_DOC_BYTES).toBe(10 * 1024 * 1024);
  });

  it("covers all blueprint levels and statuses", () => {
    expect(Object.keys(LEVEL_LABELS).sort()).toEqual(
      ["basic", "business", "identity", "professional"].sort()
    );
    expect(STATUS_LABELS.approved).toBeTruthy();
    expect(STATUS_LABELS.additional_info_required).toMatch(/information/i);
  });
});
