import DOMPurify from "dompurify";

const PRODUCT_DESCRIPTION_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "h2",
  "h3",
  "h4",
  "span",
] as const;

const PRODUCT_DESCRIPTION_ALLOWED_ATTR = ["href", "target", "rel", "class"] as const;

const PRODUCT_DESCRIPTION_ALLOWED_CLASSES = new Set(["pd-accent", "pd-err"]);

let sanitizeHooksInstalled = false;

function ensureSanitizeHooks(): void {
  if (sanitizeHooksInstalled || typeof window === "undefined") return;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName !== "class") return;
    const classes = data.attrValue
      .split(/\s+/)
      .filter((c) => PRODUCT_DESCRIPTION_ALLOWED_CLASSES.has(c));
    if (classes.length === 0) {
      data.keepAttr = false;
      return;
    }
    data.attrValue = classes.join(" ");
  });
  sanitizeHooksInstalled = true;
}

export function looksLikeProductDescriptionHtml(text: string): boolean {
  return /<[a-z][\s\S]*?>/i.test(text);
}

export function sanitizeProductDescriptionHtml(html: string): string {
  ensureSanitizeHooks();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...PRODUCT_DESCRIPTION_ALLOWED_TAGS],
    ALLOWED_ATTR: [...PRODUCT_DESCRIPTION_ALLOWED_ATTR],
  });
}

export function plainTextFromProductDescription(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim();
}
