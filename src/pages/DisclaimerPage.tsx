import type { ReactNode } from "react";
import { zhHant } from "../locale/zh-Hant.js";

function DisclaimerLeadItem({
  lead,
  children,
}: {
  lead: string;
  children: ReactNode;
}) {
  return (
    <li className="mb-3 text-[var(--muted)] last:mb-0">
      <strong className="font-bold text-[var(--fg)]">{lead}</strong>
      {children}
    </li>
  );
}

export function DisclaimerPage() {
  return (
    <div className="max-w-[46rem]">
      <h1 className="m-0 mb-2 text-[1.75rem] font-bold">{zhHant.disclaimerTitle}</h1>
      <p className="m-0 mb-6 max-w-[42rem] text-[var(--muted)]">
        {zhHant.disclaimerIntroPre}
        <strong>{zhHant.disclaimerIntroBrand}</strong>
        {zhHant.disclaimerIntroPost}
      </p>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="disclaimer-s1">
        <h2 id="disclaimer-s1" className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]">
          {zhHant.disclaimerS1Title}
        </h2>
        <ul className="m-0 list-disc pl-5 leading-[1.55]" role="list">
          <DisclaimerLeadItem lead={zhHant.disclaimerS1Lead1}>
            {zhHant.disclaimerS1Text1}
          </DisclaimerLeadItem>
          <DisclaimerLeadItem lead={zhHant.disclaimerS1Lead2}>
            {zhHant.disclaimerS1Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="disclaimer-s2">
        <h2 id="disclaimer-s2" className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]">
          {zhHant.disclaimerS2Title}
        </h2>
        <ul className="m-0 list-disc pl-5 leading-[1.55]" role="list">
          <li className="mb-3 text-[var(--muted)] last:mb-0">
            <strong className="font-bold text-[var(--fg)]">{zhHant.disclaimerS2Lead1}</strong>
            {zhHant.disclaimerS2Text1a}
            <strong>{zhHant.disclaimerS2Text1Strong}</strong>
            {zhHant.disclaimerS2Text1b}
          </li>
          <DisclaimerLeadItem lead={zhHant.disclaimerS2Lead2}>
            {zhHant.disclaimerS2Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="disclaimer-s3">
        <h2 id="disclaimer-s3" className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]">
          {zhHant.disclaimerS3Title}
        </h2>
        <ul className="m-0 list-disc pl-5 leading-[1.55]" role="list">
          <li className="mb-3 text-[var(--muted)] last:mb-0">
            <strong className="font-bold text-[var(--fg)]">{zhHant.disclaimerS3Lead1}</strong>
            {zhHant.disclaimerS3Text1a}
            <strong>{zhHant.disclaimerS3Text1Strong}</strong>
            {zhHant.disclaimerS3Text1b}
          </li>
          <DisclaimerLeadItem lead={zhHant.disclaimerS3Lead2}>
            {zhHant.disclaimerS3Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="disclaimer-s4">
        <h2 id="disclaimer-s4" className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]">
          {zhHant.disclaimerS4Title}
        </h2>
        <ul className="m-0 list-disc pl-5 leading-[1.55]" role="list">
          <DisclaimerLeadItem lead={zhHant.disclaimerS4Lead1}>
            {zhHant.disclaimerS4Text1}
          </DisclaimerLeadItem>
          <DisclaimerLeadItem lead={zhHant.disclaimerS4Lead2}>
            {zhHant.disclaimerS4Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="mb-[1.65rem] max-w-[42rem]" aria-labelledby="disclaimer-s5">
        <h2 id="disclaimer-s5" className="m-0 mb-[0.65rem] text-[1.1rem] font-bold leading-snug tracking-[0.02em] text-[var(--fg)]">
          {zhHant.disclaimerS5Title}
        </h2>
        <ul className="m-0 list-disc pl-5 leading-[1.55]" role="list">
          <li className="text-[var(--muted)]">{zhHant.disclaimerS5Text}</li>
        </ul>
      </section>

      <hr className="my-6 max-w-[42rem] border-0 border-t border-[var(--border)]" />

      <p className="m-0 max-w-[42rem] text-[0.95rem] leading-[1.55] text-[var(--muted)]">
        <em>
          {zhHant.disclaimerDisputePre}
          <strong className="font-normal not-italic text-[var(--fg)]">{zhHant.disclaimerDisputeBrand}</strong>
          {zhHant.disclaimerDisputePost}
        </em>
      </p>
    </div>
  );
}
