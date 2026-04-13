import { Link } from "wouter";
import { zhHant } from "../locale/zh-Hant.js";

export function DisclaimerPage() {
  return (
    <div>
      <h1 className="title">{zhHant.disclaimerTitle}</h1>
      <p className="lede muted">{zhHant.disclaimerLede}</p>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.disclaimerGeneralTitle}</h2>
        <p className="about-p muted">{zhHant.disclaimerGeneralP1}</p>
        <p className="about-p muted">{zhHant.disclaimerGeneralP2}</p>
      </section>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.disclaimerProductsTitle}</h2>
        <p className="about-p muted">{zhHant.disclaimerProductsP1}</p>
      </section>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.disclaimerLimitTitle}</h2>
        <p className="about-p muted">{zhHant.disclaimerLimitP1}</p>
      </section>
      <Link href="/catalog" className="btn secondary">
        {zhHant.disclaimerBackCatalog}
      </Link>
    </div>
  );
}
