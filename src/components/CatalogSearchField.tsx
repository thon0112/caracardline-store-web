import type { RefObject } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../cn.js";
import { zhHant } from "../locale/zh-Hant.js";

export type CatalogSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  id?: string;
  /** Visible label above the field (catalog filter card). */
  showLabel?: boolean;
  /** Single-row layout for the site header. */
  variant?: "default" | "compact";
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
};

function SearchFieldIcon({
  icon,
  size,
}: {
  icon: typeof faMagnifyingGlass;
  size: number;
}) {
  return (
    <FontAwesomeIcon
      icon={icon}
      style={{ fontSize: size, width: "1em", height: "1em", display: "block" }}
      aria-hidden
    />
  );
}

export function CatalogSearchField({
  value,
  onChange,
  onSubmit,
  onClear,
  id = "catalog-search-q",
  showLabel = true,
  variant = "default",
  className,
  inputRef,
  autoFocus,
}: CatalogSearchFieldProps) {
  const compact = variant === "compact";
  const canClear = Boolean(onClear && value.trim().length > 0);
  const barHeight = compact ? "min-h-[2.35rem]" : "min-h-[2.5rem]";
  const iconSize = compact ? 15 : 16;
  const actionBtnClass = compact ? "h-8 w-8" : "h-[2.1rem] w-[2.1rem]";

  return (
    <form
      className={cn(compact ? "min-w-0 w-full" : "min-w-full md:min-w-[350px]", className)}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {showLabel ? (
        <label
          className="mb-[0.35rem] block text-sm font-semibold"
          htmlFor={id}
        >
          {zhHant.catalogSearchLabel}
        </label>
      ) : null}
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] pl-[0.65rem] pr-1",
          barHeight,
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          maxLength={200}
          placeholder={zhHant.catalogSearchPlaceholder}
          aria-label={showLabel ? undefined : zhHant.catalogSearchLabel}
          autoFocus={autoFocus}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent py-2 text-[var(--fg)] outline-none",
            "placeholder:text-[color-mix(in_srgb,var(--muted)_85%,transparent)]",
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none",
            "[&::-webkit-search-decoration]:hidden",
            "text-base",
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex shrink-0 items-center gap-0.5">
          {canClear ? (
            <button
              type="button"
              className={cn(
                "inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[var(--muted)] hover:bg-[rgba(28,24,21,0.06)] hover:text-[var(--fg)]",
                actionBtnClass,
              )}
              onClick={onClear}
              aria-label={zhHant.catalogSearchClear}
              title={zhHant.catalogSearchClear}
            >
              <SearchFieldIcon icon={faXmark} size={iconSize} />
            </button>
          ) : null}
          <button
            type="submit"
            className={cn(
              "inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--accent-fill)] p-0 text-[var(--on-accent-fill)] hover:opacity-90",
              actionBtnClass,
            )}
            aria-label={zhHant.catalogSearchSubmit}
            title={zhHant.catalogSearchSubmit}
          >
            <SearchFieldIcon icon={faMagnifyingGlass} size={iconSize} />
          </button>
        </div>
      </div>
    </form>
  );
}
