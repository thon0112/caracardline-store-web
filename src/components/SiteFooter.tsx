import { Link } from "wouter";
import { zhHant } from "../locale/zh-Hant.js";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto cursor-default select-none border-t border-[var(--border)] pt-8 caret-transparent">
      <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-3">
        <p className="m-0 text-sm text-[var(--muted)] select-none caret-transparent">
          {zhHant.footerCopyright(year)}
        </p>
        <nav
          className="flex flex-wrap items-center gap-x-2 gap-y-1 select-none caret-transparent"
          aria-label={zhHant.footerNavAria}
        >
          <Link
            href="/about"
            className="cursor-pointer text-sm text-[var(--muted)] no-underline select-none caret-transparent hover:text-[var(--accent)]"
          >
            {zhHant.footerAbout}
          </Link>
          <span className="select-none text-sm text-[var(--muted)]" aria-hidden>
            ·
          </span>
          <Link
            href="/disclaimer"
            className="cursor-pointer text-sm text-[var(--muted)] no-underline select-none caret-transparent hover:text-[var(--accent)]"
          >
            {zhHant.footerDisclaimer}
          </Link>
          <span className="select-none text-sm text-[var(--muted)]" aria-hidden>
            ·
          </span>
          <span className="text-sm text-[var(--muted)] select-none caret-transparent">
            {zhHant.footerContact}
          </span>
          <span className="select-none text-sm text-[var(--muted)]" aria-hidden>
            ·
          </span>
          <span className="text-sm text-[var(--muted)] select-none caret-transparent">
            {zhHant.footerPrivacy}
          </span>
        </nav>
      </div>
    </footer>
  );
}
