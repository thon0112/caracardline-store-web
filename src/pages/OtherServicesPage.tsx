import { Link } from "wouter";
import { zhHant } from "../locale/zh-Hant.js";

export function OtherServicesPage() {
  return (
    <div>
      <h1 className="title">{zhHant.otherServicesTitle}</h1>
      <p className="lede muted">{zhHant.otherServicesLede}</p>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.otherServicesScopeTitle}</h2>
        <p className="about-p muted">{zhHant.otherServicesScopeP1}</p>
      </section>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.otherServicesHowTitle}</h2>
        <p className="about-p muted">{zhHant.otherServicesHowP1}</p>
      </section>
      <Link href="/catalog" className="btn secondary">
        {zhHant.otherServicesBackCatalog}
      </Link>
    </div>
  );
}
