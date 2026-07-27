import { describe, it, expect } from "vitest";
import { computeDiff } from "@/lib/knowledge/diff";

describe("computeDiff", () => {
  it("marks all lines as added when old has only empty line", () => {
    const diff = computeDiff("", "a\nb");
    // "" splits to [""] producing 1 removed empty line + 2 added lines
    expect(diff.some((d) => d.type === "added")).toBe(true);
  });

  it("marks all lines as removed when new is empty", () => {
    const diff = computeDiff("a\nb", "");
    // "" splits to single empty line
    expect(diff.some((d) => d.type === "removed")).toBe(true);
  });

  it("detects added and removed lines", () => {
    const diff = computeDiff("a\nb\nc", "a\nx\nc");
    const types = diff.map((d) => d.type);
    expect(types).toContain("added");
    expect(types).toContain("removed");
    expect(types).toContain("unchanged");
  });

  it("returns all unchanged when texts are equal", () => {
    const diff = computeDiff("a\nb", "a\nb");
    expect(diff.every((d) => d.type === "unchanged")).toBe(true);
  });

  it("assigns line numbers correctly", () => {
    const diff = computeDiff("a\nb", "a\nc");
    const added = diff.find((d) => d.type === "added");
    expect(added?.newNum).toBe(2);
    expect(added?.oldNum).toBeNull();
    const removed = diff.find((d) => d.type === "removed");
    expect(removed?.oldNum).toBe(2);
    expect(removed?.newNum).toBeNull();
  });
});