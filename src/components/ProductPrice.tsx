import type { CatalogListItem } from "../api.js";
import { shouldShowCompareAtPrice } from "../catalog-helpers.js";
import { cn } from "../cn.js";
import { formatPriceUsd, zhHant } from "../locale/zh-Hant.js";

type ProductPriceSize = "lg" | "md" | "sm" | "pool";

const saleClass: Record<ProductPriceSize, string> = {
  lg: "text-2xl font-bold text-[var(--accent)]",
  md: "text-[0.9rem] font-bold text-[var(--accent)]",
  sm: "text-[0.9rem] font-bold text-[var(--accent)]",
  pool: "text-[1.08rem] font-bold text-[var(--accent)] md:text-[1.19rem]",
};

const compareClass: Record<ProductPriceSize, string> = {
  lg: "text-lg text-[var(--muted)] line-through",
  md: "text-[0.8125rem] text-[var(--muted)] line-through",
  sm: "text-[0.8125rem] text-[var(--muted)] line-through",
  pool: "text-[0.9rem] text-[var(--muted)] line-through md:text-[1rem]",
};

export function ProductPrice({
  listPrice,
  compareAtPrice,
  size = "md",
  className,
}: Pick<CatalogListItem, "listPrice" | "compareAtPrice"> & {
  size?: ProductPriceSize;
  className?: string;
}) {
  const showCompareAt = shouldShowCompareAtPrice(compareAtPrice, listPrice);

  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className,
      )}
    >
      <span className={saleClass[size]}>{formatPriceUsd(listPrice)}</span>
      {showCompareAt && (
        <span className={compareClass[size]} aria-label={zhHant.compareAtPriceAria}>
          {formatPriceUsd(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
