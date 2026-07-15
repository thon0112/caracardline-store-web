import { buildAskForPriceWhatsAppUrl } from "./WhatsAppFloat.js";
import { cn } from "../cn.js";
import { zhHant } from "../locale/zh-Hant.js";

type AskForPriceWhatsAppButtonProps = {
  title: string;
  slug: string;
  className?: string;
};

export function AskForPriceWhatsAppButton({
  title,
  slug,
  className,
}: AskForPriceWhatsAppButtonProps) {
  return (
    <a
      href={buildAskForPriceWhatsAppUrl(title, slug)}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[#25d366] px-[0.85rem] py-2 text-center font-semibold text-white no-underline hover:bg-[#25d366]/80",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
    >
      {zhHant.askForPriceCta}
    </a>
  );
}
