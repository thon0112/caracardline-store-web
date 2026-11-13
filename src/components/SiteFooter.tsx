import { Link } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faThreads } from "@fortawesome/free-brands-svg-icons";
import { zhHant } from "../locale/zh-Hant.js";
import { WHATSAPP_CHAT_URL } from "./WhatsAppFloat.js";

const INSTAGRAM_URL = "https://www.instagram.com/cara.cardline/";
const THREADS_URL = "https://www.threads.com/@cara.cardline";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-auto cursor-default select-none border-t border-[rgba(197,164,109,0.28)] bg-[#0c0c0c] caret-transparent">
      <div className="shell flex flex-col gap-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <span className="inline-block h-[36px] w-[132px] overflow-hidden mix-blend-lighten">
            <img
              className="pointer-events-none block h-auto w-full -mt-[14.5%]"
              src="https://cdn.caracardline.com/assets/logo-with-text-white.webp"
              alt=""
              width={1600}
              height={900}
              decoding="async"
            />
          </span>
          <p className="m-0 text-sm tracking-[0.04em] text-[var(--muted)] select-none caret-transparent">
            {zhHant.footerCopyright(year)}
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2 select-none caret-transparent"
          aria-label={zhHant.footerNavAria}
        >
          <Link
            href="/about"
            className="cursor-pointer text-[0.78rem] uppercase tracking-[0.14em] text-[var(--muted)] no-underline select-none caret-transparent transition-colors duration-200 hover:text-[var(--accent)]"
          >
            {zhHant.footerAbout}
          </Link>

          <Link
            href="/disclaimer"
            className="cursor-pointer text-[0.78rem] uppercase tracking-[0.14em] text-[var(--muted)] no-underline select-none caret-transparent transition-colors duration-200 hover:text-[var(--accent)]"
          >
            {zhHant.footerDisclaimer}
          </Link>

          <Link
            href="/shipping"
            className="cursor-pointer text-[0.78rem] uppercase tracking-[0.14em] text-[var(--muted)] no-underline select-none caret-transparent transition-colors duration-200 hover:text-[var(--accent)]"
          >
            {zhHant.footerShipping}
          </Link>

          <Link
            href="/refund"
            className="cursor-pointer text-[0.78rem] uppercase tracking-[0.14em] text-[var(--muted)] no-underline select-none caret-transparent transition-colors duration-200 hover:text-[var(--accent)]"
          >
            {zhHant.footerRefund}
          </Link>

          <a
            href={WHATSAPP_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-[0.78rem] uppercase tracking-[0.14em] text-[var(--muted)] no-underline select-none caret-transparent transition-colors duration-200 hover:text-[var(--accent)]"
            aria-label={zhHant.floatWhatsAppAria}
          >
            {zhHant.footerContact}
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 text-[var(--muted)] no-underline select-none caret-transparent transition-colors duration-200 hover:text-[var(--accent)]"
            aria-label={zhHant.navInstagramAria}
            title={zhHant.navInstagram}
          >
            <FontAwesomeIcon
              icon={faInstagram}
              style={{ fontSize: 20, width: "1em", height: "1em", display: "block" }}
              aria-hidden
            />
          </a>

          <a
            href={THREADS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 text-[var(--muted)] no-underline select-none caret-transparent transition-colors duration-200 hover:text-[var(--accent)]"
            aria-label={zhHant.navThreadsAria}
            title={zhHant.navThreads}
          >
            <FontAwesomeIcon
              icon={faThreads}
              style={{ fontSize: 20, width: "1em", height: "1em", display: "block" }}
              aria-hidden
            />
          </a>
        </nav>
      </div>
    </footer>
  );
}
