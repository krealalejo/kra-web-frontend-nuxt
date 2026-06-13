import { describe, it, expect, vi, afterEach } from "vitest";
import { useMarkdown } from "./useMarkdown";

vi.mock("marked", () => {
  class Renderer {
    heading = vi.fn();
    paragraph = vi.fn((text: string) => text);
    text = vi.fn((text: string) => text);
    image = vi.fn(({ href, text: alt, title }: any) => {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${href}" alt="${alt}"${titleAttr}>`;
    });
  }
  return {
    marked: {
      parse: vi
        .fn()
        .mockImplementation((text: string, options?: { renderer?: any }) => {
          if (options?.renderer?.heading) {
            text = text.replace(
              /^(#{1,6})\s+(.*)$/gm,
              (_, hashes: string, content: string) =>
                options.renderer.heading({ text: content, depth: hashes.length }),
            );
          }
          if (options?.renderer?.image) {
            return text.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (_, alt, href) =>
              options.renderer.image({ href, text: alt, title: undefined }),
            );
          }
          return `<p>${text}</p>`;
        }),
      Renderer,
    },
    Renderer,
  };
});

vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

vi.mock("sanitize-html", () => ({
  default: Object.assign(
    vi.fn((html: string) => html),
    {
      defaults: {
        allowedTags: ["p"],
        allowedAttributes: { p: [] },
      },
    },
  ),
}));

describe("useMarkdown", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("stripMarkdown", () => {
    it("removes heading markers", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("# Title")).toBe("Title");
      expect(stripMarkdown("## Sub")).toBe("Sub");
      expect(stripMarkdown("### Deep")).toBe("Deep");
    });

    it("removes bold syntax", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("**bold text**")).toBe("bold text");
      expect(stripMarkdown("__bold__")).toBe("bold");
    });

    it("removes italic syntax", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("*italic*")).toBe("italic");
      expect(stripMarkdown("_italic_")).toBe("italic");
    });

    it("removes inline code", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("`code`")).toBe("");
    });

    it("replaces links with label text", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("[link text](https://example.com)")).toBe(
        "link text",
      );
    });

    it("removes list markers", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("- item")).toBe("item");
      expect(stripMarkdown("* item")).toBe("item");
      expect(stripMarkdown("+ item")).toBe("item");
      expect(stripMarkdown("1. item")).toBe("item");
    });

    it("removes images", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("![alt text](https://example.com/image.png)")).toBe(
        "",
      );
    });

    it("removes code blocks", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("```javascript\nconst x = 1\n```")).toBe("");
    });

    it("collapses multiple newlines to a space", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("a\n\nb")).toBe("a b");
    });

    it("handles empty string", () => {
      const { stripMarkdown } = useMarkdown();
      expect(stripMarkdown("")).toBe("");
    });
  });

  describe("sanitizeMarkdown", () => {
    it("returns string output", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown("hello world");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("handles empty string", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown("");
      expect(typeof result).toBe("string");
    });

    it("renders headings with slugified id anchors", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown("## Hello World! @2024");
      expect(result).toContain('<h2 id="hello-world-2024">');
      expect(result).toContain("Hello World! @2024</h2>");
    });

    it("strips HTML tags and trims dashes when building heading id", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown("### --Edge-- <b>Case</b>");
      expect(result).toContain('id="edge-case"');
    });

    it("uses sanitize-html on server", async () => {
      const { sanitizeMarkdown } = useMarkdown();

      vi.stubGlobal("process", { server: true });
      const result = await sanitizeMarkdown(
        'hello <script>alert("xss")</script> world',
      );
      expect(typeof result).toBe("string");
    });

    it("uses DOMPurify on client", async () => {
      const { sanitizeMarkdown } = useMarkdown();

      vi.stubGlobal("process", { server: false });
      const result = await sanitizeMarkdown("hello world");
      expect(typeof result).toBe("string");
    });
  });

  describe("sanitizeMarkdown with imageBaseUrl", () => {
    const base = "https://raw.githubusercontent.com/owner/repo/main";

    it("converts relative path to absolute URL", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown("![demo](docs/demo.gif)", base);
      expect(result).toContain(`${base}/docs/demo.gif`);
    });

    it("strips leading ./ from relative paths", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown(
        "![screenshot](./screenshot.png)",
        base,
      );
      expect(result).toContain(`${base}/screenshot.png`);
      expect(result).not.toContain("./screenshot.png");
    });

    it("leaves absolute https:// URLs unchanged", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown(
        "![logo](https://example.com/logo.png)",
        base,
      );
      expect(result).toContain("https://example.com/logo.png");
      expect(result).not.toContain(`${base}/https`);
    });

    it("leaves relative paths as-is when no imageBaseUrl provided", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown("![demo](docs/demo.gif)");
      expect(result).toContain("docs/demo.gif");
      expect(result).not.toContain("raw.githubusercontent.com");
    });

    it("handles base URL without trailing slash", async () => {
      const { sanitizeMarkdown } = useMarkdown();
      const result = await sanitizeMarkdown("![demo](docs/demo.gif)", base);
      expect(result).toContain(`${base}/docs/demo.gif`);
      expect(result).not.toContain("main//docs");
    });
  });

  describe("extractHeadings", () => {
    it("extracts level 2 headings", () => {
      const { extractHeadings } = useMarkdown();
      const text = "## Heading 1\nSome text\n## Heading 2";
      const result = extractHeadings(text);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ title: "Heading 1", id: "heading-1" });
      expect(result[1]).toEqual({ title: "Heading 2", id: "heading-2" });
    });

    it("ignores other levels", () => {
      const { extractHeadings } = useMarkdown();
      const text = "# Level 1\n### Level 3";
      const result = extractHeadings(text);
      expect(result).toHaveLength(0);
    });

    it("slugifies titles with special characters", () => {
      const { extractHeadings } = useMarkdown();
      const text = "## Hello World! @2024";
      const result = extractHeadings(text);
      expect(result[0].id).toBe("hello-world-2024");
    });

    it("handles empty string", () => {
      const { extractHeadings } = useMarkdown();
      expect(extractHeadings("")).toHaveLength(0);
    });
  });
});
