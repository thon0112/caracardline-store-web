import OurService from "../components/OurService.js";
import { zhHant } from "../locale/zh-Hant.js";

export function AboutPage() {
  return (
    <div className="max-w-[46rem]">
      <h1 className="m-0 mb-2 text-[1.75rem] font-bold">{zhHant.aboutTitle}</h1>
      <p className="m-0 mb-[0.85rem] max-w-[42rem] leading-[1.55] text-[var(--muted)]">
        {zhHant.aboutIntroP2}
      </p>
      <p className="m-0 mb-[0.85rem] max-w-[42rem] leading-[1.55] text-[var(--muted)]">
        {zhHant.aboutIntroP3}
      </p>

      <section
        className="mb-7 rounded-2xl border border-[color-mix(in_srgb,var(--border)_78%,var(--accent)_22%)] bg-gradient-to-br from-[color-mix(in_srgb,var(--card)_92%,var(--accent))] via-[var(--card)] to-[var(--card)] px-[1.15rem] pb-[1.35rem] pt-5 shadow-[0_10px_36px_rgba(28,24,21,0.06)]"
        aria-labelledby="about-services-heading"
      >
        <h2
          id="about-services-heading"
          className="m-0 mb-[1.05rem] flex flex-wrap items-center gap-[0.65rem] text-[1.15rem] font-bold tracking-[0.02em] text-[var(--fg)] before:block before:h-[1.15em] before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[var(--accent-fill)] before:to-[color-mix(in_srgb,var(--accent-fill)_35%,var(--border))] before:content-['']"
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
