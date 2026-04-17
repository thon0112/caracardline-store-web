import { Link } from "wouter";
import { zhHant } from "../locale/zh-Hant.js";

export function OtherServicesPage() {
  return (
    <div>
      <h1 className="m-0 mb-2 text-[1.75rem] font-bold">{zhHant.otherServicesTitle}</h1>
      <p className="m-0 mb-6 max-w-[42rem] text-[var(--muted)]">{zhHant.otherServicesLede}</p>
      <section className="mb-7 max-w-[42rem]">
        <h2 className="m-0 mb-[0.65rem] text-[1.1rem] font-semibold text-[var(--fg)]">
          {zhHant.otherServicesScopeTitle}
        </h2>
        <p className="m-0 leading-[1.55] text-[var(--muted)]">{zhHant.otherServicesScopeP1}</p>
      </section>
      <section className="mb-7 max-w-[42rem]">
        <h2 className="m-0 mb-[0.65rem] text-[1.1rem] font-semibold text-[var(--fg)]">
          {zhHant.otherServicesHowTitle}
        </h2>
        <p className="m-0 leading-[1.55] text-[var(--muted)]">{zhHant.otherServicesHowP1}</p>
      </section>
      <Link
        href="/catalog"
        className="mx-0 mb-0 mt-6 inline-block cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-[0.85rem] py-2 font-semibold text-[var(--fg)] no-underline hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
      >
        {zhHant.otherServicesBackCatalog}
      </Link>
    </div>
  );
}
