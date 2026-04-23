import { zhHant } from "../locale/zh-Hant";

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

  const OurService = () => {
    return (
        <ul className="m-0 flex list-none flex-col gap-4 p-0" role="list">
        {ABOUT_SERVICES.map(({ titleKey, bodyKey, labelKey, chipsKey, icon }, i) => (
          <li
            key={titleKey}
            className="relative m-0 overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--card)] shadow-[0_2px_0_rgba(28,24,21,0.03)] transition-[border-color,box-shadow,transform] duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--border)_55%,var(--accent)_45%)] hover:shadow-[0_12px_32px_rgba(28,24,21,0.08)] motion-reduce:hover:translate-y-0"
            role="listitem"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-55 [background:radial-gradient(120%_85%_at_0%_0%,color-mix(in_srgb,var(--accent-fill)_22%,transparent)_0%,transparent_58%)]"
              aria-hidden
            />
            <div className="relative z-[1] px-[1.2rem] pb-5 pt-[1.15rem]">
              <div className="mb-3 flex items-start gap-[0.9rem]">
                <span className="inline-flex h-[2.85rem] w-[2.85rem] shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--border)_70%,var(--accent)_30%)] bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-fill)_14%,var(--card))] to-[var(--card)] text-[var(--accent-fill)] shadow-[inset_0_1px_0_rgba(255,253,251,0.65)]">
                  <AboutServiceIcon id={icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="mb-[0.35rem] inline-flex items-center gap-[0.45rem] text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                    <span
                      className="inline-flex min-w-[1.35rem] items-center justify-center rounded-md bg-gradient-to-br from-[var(--accent-fill)] to-[color-mix(in_srgb,var(--accent-fill)_72%,var(--fg))] px-[0.28rem] py-[0.12rem] text-[0.65rem] font-bold tracking-[0.06em] text-[var(--on-accent-fill)]"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {zhHant[labelKey]}
                  </span>
                  <h3 className="m-0 text-base font-bold leading-snug tracking-[0.02em] text-[var(--accent)]">
                    {zhHant[titleKey]}
                  </h3>
                </div>
              </div>
              <ul className="m-0 mb-[0.85rem] flex list-none flex-wrap gap-x-[0.45rem] gap-y-1 p-0" aria-label={`${zhHant[labelKey]}重點`}>
                {zhHant[chipsKey].map((chip) => (
                  <li
                    key={chip}
                    className="m-0 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--media-bg)_55%,var(--card))] px-[0.55rem] py-[0.28rem] text-[0.75rem] font-semibold leading-snug tracking-[0.02em] text-[var(--fg)]"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
              <p className="m-0 border-t border-dashed border-[color-mix(in_srgb,var(--border)_65%,transparent)] pt-[0.65rem] leading-[1.55] text-[var(--muted)]">
                {zhHant[bodyKey]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  export default OurService;