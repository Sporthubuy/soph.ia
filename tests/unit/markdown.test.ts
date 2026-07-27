import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/knowledge/markdown";

describe("renderMarkdown", () => {
  it("renders headings", () => {
    expect(renderMarkdown("# H1")).toContain("<h1>");
    expect(renderMarkdown("### H3")).toContain("<h3>");
  });

  it("renders bold and italic inline", () => {
    const html = renderMarkdown("esto es **bold** y *italic*");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders unordered lists", () => {
    const html = renderMarkdown("- uno\n- dos");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>uno</li>");
    expect(html).toContain("<li>dos</li>");
  });

  it("renders code fences", () => {
    const html = renderMarkdown("```\ncode block\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("code block");
  });

  it("renders inline code", () => {
    expect(renderMarkdown("usa `x` aqui")).toContain("<code>x</code>");
  });

  it("escapes html", () => {
    const html = renderMarkdown("<script>x</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("renders links", () => {
    expect(renderMarkdown("[Google](https://google.com)")).toContain(
      '<a href="https://google.com">Google</a>'
    );
  });
});