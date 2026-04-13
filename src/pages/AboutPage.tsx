import { Link } from "wouter";
import { zhHant } from "../locale/zh-Hant.js";

export function AboutPage() {
  return (
    <div>
      <h1 className="title">{zhHant.aboutTitle}</h1>
      <p className="lede muted">{zhHant.aboutLede}</p>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.aboutWhoTitle}</h2>
        <p className="about-p muted">{zhHant.aboutWhoP1}</p>
        <p className="about-p muted">{zhHant.aboutWhoP2}</p>
      </section>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.aboutMissionTitle}</h2>
        <p className="about-p muted">{zhHant.aboutMissionP1}</p>
      </section>
      <section className="about-section">
        <h2 className="about-section-title">{zhHant.aboutContactTitle}</h2>
        <p className="about-p muted">{zhHant.aboutContactP1}</p>
      </section>
      <Link href="/catalog" className="btn secondary">
        {zhHant.aboutBackCatalog}
      </Link>
    </div>
  );
}
