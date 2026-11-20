import { describe, it, expect } from "vitest";
import { fitWithin, extensionFor, renameWithExtension } from "../image-compress";
import { MAX_UPLOAD_BYTES, isOverUploadLimit } from "../upload-limits";

describe("upload limit", () => {
  it("is 1MB for every plan (no per-tier override)", () => {
    expect(MAX_UPLOAD_BYTES).toBe(1024 * 1024);
    expect(isOverUploadLimit({ size: MAX_UPLOAD_BYTES })).toBe(false);
    expect(isOverUploadLimit({ size: MAX_UPLOAD_BYTES + 1 })).toBe(true);
  });
});

describe("image-compress helpers", () => {
  it("fits within max without upscaling", () => {
    expect(fitWithin(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
    expect(fitWithin(3000, 4000, 2000)).toEqual({ width: 1500, height: 2000 });
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
  it("maps extensions and renames", () => {
    expect(extensionFor("image/png")).toBe("png");
    expect(extensionFor("image/webp")).toBe("webp");
    expect(extensionFor("image/jpeg")).toBe("jpg");
    expect(renameWithExtension("IMG_1234.PNG", "image/webp")).toBe("IMG_1234.webp");
    expect(renameWithExtension("photo", "image/jpeg")).toBe("photo.jpg");
  });
});
