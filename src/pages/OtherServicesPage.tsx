import { useDocumentMeta } from "../document-meta.js";
import { zhHant } from "../locale/zh-Hant.js";
import OurService from "../components/OurService.js";
import { PAGE_META } from "../page-meta.js";

export function OtherServicesPage() {
  useDocumentMeta(PAGE_META.services);
  return (
    <div>
      <h1 className="m-0 mb-4 text-[1.75rem] font-bold">{zhHant.otherServicesTitle}</h1>
      <section className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="m-0 text-[1.1rem] font-bold text-[var(--fg)]">
          {zhHant.navCardRepair}
        </h2>
        <p className="m-0 mt-2 leading-[1.55] text-[var(--muted)]">
          {zhHant.cardRepairLede}
        </p>
        <a
          href="/card-repair"
          className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-[0.95rem] font-semibold text-[var(--fg)] no-underline hover:text-[var(--accent)]"
        >
          {zhHant.navCardRepair}
        </a>
      </section>
      <OurService />
      <section className="mt-4 mb-7 max-w-[42rem]">
        <h2 className="m-0 mb-[0.65rem] text-[1.1rem] font-semibold text-[var(--fg)]">
          {zhHant.otherServicesHowTitle}
        </h2>
        <p className="m-0 leading-[1.55] text-[var(--muted)]">{zhHant.otherServicesHowP1}</p>
      </section>
    </div>
  );
}
