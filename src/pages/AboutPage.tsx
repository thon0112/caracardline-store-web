import type { CSSProperties } from "react";
import { zhHant } from "../locale/zh-Hant.js";

const ABOUT_SERVICES = [
  {
    titleKey: "aboutSvc1Title" as const,
    bodyKey: "aboutSvc1Body" as const,
    labelKey: "aboutSvc1Label" as const,
    chipsKey: "aboutSvc1Chips" as const,
    icon: "treasure" as const,
  },
  {
    titleKey: "aboutSvc2Title" as const,
    bodyKey: "aboutSvc2Body" as const,
    labelKey: "aboutSvc2Label" as const,
    chipsKey: "aboutSvc2Chips" as const,
    icon: "grading" as const,
  },
  {
    titleKey: "aboutSvc3Title" as const,
    bodyKey: "aboutSvc3Body" as const,
    labelKey: "aboutSvc3Label" as const,
    chipsKey: "aboutSvc3Chips" as const,
    icon: "care" as const,
  },
  {
    titleKey: "aboutSvc4Title" as const,
    bodyKey: "aboutSvc4Body" as const,
    labelKey: "aboutSvc4Label" as const,
    chipsKey: "aboutSvc4Chips" as const,
    icon: "trade" as const,
  },
] as const;

type AboutServiceIconId = (typeof ABOUT_SERVICES)[number]["icon"];

function AboutServiceIcon({ id }: { id: AboutServiceIconId }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };
  const stroke = "currentColor";
  const sw = 1.65;
  switch (id) {
    case "treasure":
      return (
        <svg {...common}>
          <circle cx="11.75" cy="11.75" r="6.35" stroke={stroke} strokeWidth={sw} />
          <path
            d="M17.2 17.2 22.25 22.25"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d="M8.5 11.75h6.5M11.75 8.5v6.5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "grading":
      return (
        <svg {...common}>
          <rect
            x="5.5"
            y="6.5"
            width="17"
            height="15"
            rx="2.25"
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d="M9 11.5h10M9 15h7"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d="M11 19.5h6"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "care":
      return (
        <svg {...common}>
          <path
            d="M14 22c-4.2-2.6-7-5.4-7-9.2A4.7 4.7 0 0 1 14 9.2v0a4.7 4.7 0 0 1 7 3.6c0 3.8-2.8 6.6-7 9.2Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path
            d="m11.2 13.8 1.8 1.8 3.8-4.5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "trade":
      return (
        <svg {...common}>
          <path
            d="M7.5 10.5h9M16.5 10.5l-2-2m2 2-2 2"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.5 17.5h-9M11.5 17.5l2 2m-2-2 2-2"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function AboutPage() {
  return (
    <div className="about-page">
      <h1 className="title">{zhHant.aboutTitle}</h1>
      <p className="lede muted">{zhHant.aboutLede}</p>
      <p className="about-p muted">{zhHant.aboutIntroP2}</p>
      <p className="about-p muted">{zhHant.aboutIntroP3}</p>

      <section className="about-services" aria-labelledby="about-services-heading">
        <h2 id="about-services-heading" className="about-services-heading">
          {zhHant.aboutServicesHeading}
        </h2>
        <ul className="about-service-grid" role="list">
          {ABOUT_SERVICES.map(({ titleKey, bodyKey, labelKey, chipsKey, icon }, i) => (
            <li
              key={titleKey}
              className="about-service-card"
              role="listitem"
              style={{ "--about-svc-i": i } as CSSProperties}
            >
              <div className="about-service-card-glow" aria-hidden />
              <div className="about-service-card-inner">
                <div className="about-service-card-top">
                  <span className="about-service-icon-wrap">
                    <AboutServiceIcon id={icon} />
                  </span>
                  <div className="about-service-card-top-text">
                    <span className="about-service-label">
                      <span className="about-service-label-index" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {zhHant[labelKey]}
                    </span>
                    <h3 className="about-service-card-title">{zhHant[titleKey]}</h3>
                  </div>
                </div>
                <ul className="about-service-chips" aria-label={`${zhHant[labelKey]}重點`}>
                  {zhHant[chipsKey].map((chip) => (
                    <li key={chip} className="about-service-chip">
                      {chip}
                    </li>
                  ))}
                </ul>
                <p className="about-p muted about-service-card-text">{zhHant[bodyKey]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section about-outro">
        <p className="about-p muted">{zhHant.aboutClosing1}</p>
        <p className="about-p muted">
          {zhHant.aboutClosing2Prefix}
          <a
            href="https://www.instagram.com/cara.cardline/"
            className="about-inline-link"
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
