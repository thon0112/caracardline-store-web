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
    <li className="disclaimer-li muted">
      <strong className="disclaimer-li-lead">{lead}</strong>
      {children}
    </li>
  );
}

export function DisclaimerPage() {
  return (
    <div className="disclaimer-page">
      <h1 className="title">{zhHant.disclaimerTitle}</h1>
      <p className="lede muted">
        {zhHant.disclaimerIntroPre}
        <strong>{zhHant.disclaimerIntroBrand}</strong>
        {zhHant.disclaimerIntroPost}
      </p>

      <section className="disclaimer-block" aria-labelledby="disclaimer-s1">
        <h2 id="disclaimer-s1" className="disclaimer-heading">
          {zhHant.disclaimerS1Title}
        </h2>
        <ul className="disclaimer-list" role="list">
          <DisclaimerLeadItem lead={zhHant.disclaimerS1Lead1}>
            {zhHant.disclaimerS1Text1}
          </DisclaimerLeadItem>
          <DisclaimerLeadItem lead={zhHant.disclaimerS1Lead2}>
            {zhHant.disclaimerS1Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="disclaimer-block" aria-labelledby="disclaimer-s2">
        <h2 id="disclaimer-s2" className="disclaimer-heading">
          {zhHant.disclaimerS2Title}
        </h2>
        <ul className="disclaimer-list" role="list">
          <li className="disclaimer-li muted">
            <strong className="disclaimer-li-lead">{zhHant.disclaimerS2Lead1}</strong>
            {zhHant.disclaimerS2Text1a}
            <strong>{zhHant.disclaimerS2Text1Strong}</strong>
            {zhHant.disclaimerS2Text1b}
          </li>
          <DisclaimerLeadItem lead={zhHant.disclaimerS2Lead2}>
            {zhHant.disclaimerS2Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="disclaimer-block" aria-labelledby="disclaimer-s3">
        <h2 id="disclaimer-s3" className="disclaimer-heading">
          {zhHant.disclaimerS3Title}
        </h2>
        <ul className="disclaimer-list" role="list">
          <li className="disclaimer-li muted">
            <strong className="disclaimer-li-lead">{zhHant.disclaimerS3Lead1}</strong>
            {zhHant.disclaimerS3Text1a}
            <strong>{zhHant.disclaimerS3Text1Strong}</strong>
            {zhHant.disclaimerS3Text1b}
          </li>
          <DisclaimerLeadItem lead={zhHant.disclaimerS3Lead2}>
            {zhHant.disclaimerS3Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="disclaimer-block" aria-labelledby="disclaimer-s4">
        <h2 id="disclaimer-s4" className="disclaimer-heading">
          {zhHant.disclaimerS4Title}
        </h2>
        <ul className="disclaimer-list" role="list">
          <DisclaimerLeadItem lead={zhHant.disclaimerS4Lead1}>
            {zhHant.disclaimerS4Text1}
          </DisclaimerLeadItem>
          <DisclaimerLeadItem lead={zhHant.disclaimerS4Lead2}>
            {zhHant.disclaimerS4Text2}
          </DisclaimerLeadItem>
        </ul>
      </section>

      <section className="disclaimer-block" aria-labelledby="disclaimer-s5">
        <h2 id="disclaimer-s5" className="disclaimer-heading">
          {zhHant.disclaimerS5Title}
        </h2>
        <ul className="disclaimer-list" role="list">
          <li className="disclaimer-li muted">{zhHant.disclaimerS5Text}</li>
        </ul>
      </section>

      <hr className="disclaimer-rule" />

      <p className="disclaimer-final muted">
        <em>
          {zhHant.disclaimerDisputePre}
          <strong>{zhHant.disclaimerDisputeBrand}</strong>
          {zhHant.disclaimerDisputePost}
        </em>
      </p>
    </div>
  );
}
