import OurService from "../components/OurService.js";
import { useDocumentMeta } from "../document-meta.js";
import { zhHant } from "../locale/zh-Hant.js";
import { PAGE_META } from "../page-meta.js";

export function AboutPage() {
  useDocumentMeta(PAGE_META.about);
  return (
    <div className="max-w-[46rem]">
      <h1 className="m-0 mb-3 text-[2rem] font-medium tracking-[0.03em] md:text-[2.35rem]">{zhHant.aboutTitle}</h1>
      <p className="m-0 mb-[0.85rem] max-w-[42rem] leading-[1.55] text-[var(--muted)]">
        {zhHant.aboutIntroP2}
      </p>
      <p className="m-0 mb-[0.85rem] max-w-[42rem] leading-[1.55] text-[var(--muted)]">
        {zhHant.aboutIntroP3}
      </p>

      <section
        className="mb-7 rounded-lg border border-[rgba(197,164,109,0.28)] bg-[var(--card)] px-[1.15rem] pb-[1.35rem] pt-5"
        aria-labelledby="about-services-heading"
      >
        <h2
          id="about-services-heading"
          className="m-0 mb-[1.05rem] flex flex-wrap items-center gap-[0.65rem] text-[1.45rem] font-medium tracking-[0.04em] text-[var(--fg)] before:block before:h-[1.05em] before:w-px before:bg-[var(--accent)] before:content-['']"
        >
          {zhHant.aboutServicesHeading}
        </h2>
        <OurService />
      </section>

      <section className="mb-7 max-w-[42rem]">
        <p className="m-0 mb-[0.85rem] leading-[1.55] text-[var(--muted)]">{zhHant.aboutClosing1}</p>
        <p className="m-0 leading-[1.55] text-[var(--muted)]">
          {zhHant.aboutClosing2Prefix}
          <a
            href="https://www.instagram.com/cara.cardline/"
            className="font-semibold text-[var(--accent)] no-underline hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {zhHant.aboutInstagramAt}
          </a>
          {zhHant.aboutClosing2Suffix}
        </p>
      </section>
    </div>
  );
}
