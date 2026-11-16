import { describe, expect, it } from "vitest";
import {
  sanitiseSearchTerm,
  ilikeContains,
  orIlikeClause
} from "@/features/marketplace/lib/search";

describe("sanitiseSearchTerm", () => {
  it("trims and caps length", () => {
    expect(sanitiseSearchTerm("  hello  ")).toBe("hello");
    expect(sanitiseSearchTerm("a".repeat(200)).length).toBeLessThanOrEqual(100);
  });

  it("strips PostgREST metacharacters and LIKE wildcards", () => {
    expect(sanitiseSearchTerm("foo,bar")).not.toContain(",");
    expect(sanitiseSearchTerm("a(b)")).not.toMatch(/[()]/);
    expect(sanitiseSearchTerm("100%_off")).not.toMatch(/[%_]/);
  });

  it("returns empty for nullish", () => {
    expect(sanitiseSearchTerm(null)).toBe("");
    expect(sanitiseSearchTerm(undefined)).toBe("");
  });
});

describe("orIlikeClause", () => {
  it("returns null for empty term", () => {
    expect(orIlikeClause(["title"], "")).toBeNull();
  });

  it("builds quoted ilike clauses without raw commas from input", () => {
    const clause = orIlikeClause(["title", "description"], "clean term");
    expect(clause).toContain("title.ilike.");
    expect(clause).toContain("description.ilike.");
    const bad = orIlikeClause(["title"], "a,b");
    expect(bad).not.toBeNull();
    expect(bad!.split(",").length).toBe(1);
  });
});

describe("ilikeContains", () => {
  it("wraps sanitised term with percent signs", () => {
    expect(ilikeContains("plumbing")).toBe("%plumbing%");
    expect(ilikeContains("")).toBe("");
  });
});
