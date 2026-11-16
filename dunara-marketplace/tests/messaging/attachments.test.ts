import { describe, expect, it } from "vitest";
import {
  ALLOWED_ATTACHMENT_MIME,
  MAX_ATTACHMENT_BYTES,
} from "@/features/messaging/lib/types";

describe("messaging attachment rules", () => {
  it("allows only jpeg, png, webp, pdf", () => {
    expect(ALLOWED_ATTACHMENT_MIME).toContain("image/jpeg");
    expect(ALLOWED_ATTACHMENT_MIME).toContain("image/png");
    expect(ALLOWED_ATTACHMENT_MIME).toContain("image/webp");
    expect(ALLOWED_ATTACHMENT_MIME).toContain("application/pdf");
    expect(ALLOWED_ATTACHMENT_MIME).not.toContain("application/zip");
    expect(ALLOWED_ATTACHMENT_MIME).not.toContain("text/html");
  });

  it("caps file size at 5 MiB", () => {
    expect(MAX_ATTACHMENT_BYTES).toBe(5 * 1024 * 1024);
  });
});
