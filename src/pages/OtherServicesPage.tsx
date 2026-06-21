import { useDocumentMeta } from "../document-meta.js";
import { zhHant } from "../locale/zh-Hant.js";
import OurService from "../components/OurService.js";
import { PAGE_META } from "../page-meta.js";

export function OtherServicesPage() {
  useDocumentMeta(PAGE_META.services);
  return (
    <div>
      <h1 className="m-0 mb-4 text-[1.75rem] font-bold">{zhHant.otherServicesTitle}</h1>
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
