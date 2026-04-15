import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "wouter";
import { homeBannerSlides } from "../home-banner-slides.js";
import { zhHant } from "../locale/zh-Hant.js";

const BANNER_INTERVAL_MS = 6500;

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

export function HomeBannerCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const bannerCount = homeBannerSlides.length;

  const emblaOptions = useMemo(
    () => ({
      loop: bannerCount > 1,
      align: "center" as const,
      /** Lets first/last snaps wrap when `loop` is enabled */
      containScroll: false as const,
      duration: reducedMotion ? 0 : 28,
    }),
    [bannerCount, reducedMotion],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    if (reducedMotion || bannerCount <= 1) return;
    const t = window.setInterval(() => emblaApi.scrollNext(), BANNER_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [emblaApi, reducedMotion, bannerCount]);

  const goBanner = useCallback(
    (delta: number) => {
      if (!emblaApi) return;
      if (delta < 0) emblaApi.scrollPrev();
      else emblaApi.scrollNext();
    },
    [emblaApi],
  );

  return (
    <section
      className="home-hero-bleed"
      aria-roledescription="carousel"
      aria-label={zhHant.homeBannerAria}
    >
      <div className="home-hero">
        <div className="home-hero-viewport" ref={emblaRef}>
          <div className="home-hero-slides">
            {homeBannerSlides.map((b, i) => {
              const img = (
                <img
                  className="home-hero-slide-img"
                  src={b.src}
                  alt={b.alt}
                  width={1600}
                  height={900}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "low"}
                  referrerPolicy="no-referrer-when-downgrade"
                  draggable={false}
                />
              );
              return (
                <div
                  key={b.id}
                  className="home-hero-slide"
                  aria-hidden={i !== selectedIndex}
                >
                  {isExternalHref(b.href) ? (
                    <a
                      href={b.href}
                      className="home-hero-slide-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {img}
                    </a>
                  ) : (
                    <Link href={b.href} className="home-hero-slide-link">
                      {img}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {bannerCount > 1 ? (
          <>
            <button
              type="button"
              className="home-hero-nav home-hero-nav--prev"
              aria-label={zhHant.homeBannerPrev}
              onClick={() => goBanner(-1)}
            />
            <button
              type="button"
              className="home-hero-nav home-hero-nav--next"
              aria-label={zhHant.homeBannerNext}
              onClick={() => goBanner(1)}
            />
            <div className="home-hero-dots" role="tablist" aria-label={zhHant.homeBannerDots}>
              {homeBannerSlides.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === selectedIndex}
                  className={`home-hero-dot${i === selectedIndex ? " is-active" : ""}`}
                  aria-label={`${zhHant.homeBannerSlide} ${i + 1}：${b.alt}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
