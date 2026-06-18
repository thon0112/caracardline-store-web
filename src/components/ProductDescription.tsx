import { cn } from "../cn.js";
import {
  looksLikeProductDescriptionHtml,
  sanitizeProductDescriptionHtml,
} from "../product-description.js";

export function ProductDescription({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (looksLikeProductDescriptionHtml(trimmed)) {
    const html = sanitizeProductDescriptionHtml(trimmed);
    if (!html.trim()) return null;
    return (
      <div
        className={cn(
          "product-description m-0 mb-6 mt-3 max-w-[42rem]",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <p
      className={cn(
        "m-0 mb-6 mt-3 max-w-[42rem] whitespace-pre-line",
        className,
      )}
    >
      {trimmed}
    </p>
  );
}
