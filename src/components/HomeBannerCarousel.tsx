import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "wouter";
import { homeBannerSlides } from "../home-banner-slides.js";
import { zhHant } from "../locale/zh-Hant.js";

const BANNER_INTERVAL_MS = 6500;
const HERO_DESKTOP_MQ = "(min-width: 768px)";
/** Extra copies on desktop so total slide width passes Embla’s `canLoop()` check on wide viewports */
const DESKTOP_LOOP_COPIES = 3;

function subscribeHeroDesktop(onChange: () => void) {
  const mq = window.matchMedia(HERO_DESKTOP_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getHeroDesktopSnapshot() {
  return window.matchMedia(HERO_DESKTOP_MQ).matches;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

export function HomeBannerCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const baseSlideCount = homeBannerSlides.length;
  const heroDesktop = useSyncExternalStore(
    subscribeHeroDesktop,
    getHeroDesktopSnapshot,
    () => false,
  );

  const emblaSlides = useMemo(() => {
    if (!heroDesktop || baseSlideCount <= 1) return [...homeBannerSlides];
    return Array.from({ length: DESKTOP_LOOP_COPIES }, () => [...homeBannerSlides]).flat();
  }, [heroDesktop, baseSlideCount]);

  const emblaSlideCount = emblaSlides.length;

  const emblaOptions = useMemo(
    () => ({
      loop: emblaSlideCount > 1,
      align: heroDesktop ? ("center" as const) : ("start" as const),
      /** Lets first/last snaps wrap when `loop` is enabled */
      containScroll: false as const,
      duration: reducedMotion ? 0 : 28,
      startIndex:
        heroDesktop && baseSlideCount > 1 ? baseSlideCount : 0,
    }),
    [emblaSlideCount, baseSlideCount, reducedMotion, heroDesktop],
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
    const onSelect = () =>
      setSelectedIndex(emblaApi.selectedScrollSnap() % baseSlideCount);
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, baseSlideCount]);

  useEffect(() => {
    if (!emblaApi) return;
    if (reducedMotion || baseSlideCount <= 1) return;
    const t = window.setInterval(() => emblaApi.scrollNext(), BANNER_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [emblaApi, reducedMotion, baseSlideCount]);

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
            {emblaSlides.map((b, i) => {
              const logical = i % baseSlideCount;
              const isPrimaryMount =
                i === (heroDesktop && baseSlideCount > 1 ? baseSlideCount : 0);
              const img = (
                <img
                  className="home-hero-slide-img"
                  src={b.src}
                  alt={b.alt}
                  width={1600}
                  height={900}
                  loading={isPrimaryMount && logical === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={isPrimaryMount && logical === 0 ? "high" : "low"}
                  referrerPolicy="no-referrer-when-downgrade"
                  draggable={false}
                />
              );
              return (
                <div
                  key={`${b.id}__${i}`}
                  className="home-hero-slide"
                  aria-hidden={logical !== selectedIndex}
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
        {baseSlideCount > 1 ? (
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
                  onClick={() => {
                    if (!emblaApi) return;
                    const raw = emblaApi.selectedScrollSnap();
                    const block = Math.floor(raw / baseSlideCount) * baseSlideCount;
                    emblaApi.scrollTo(block + i);
                  }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
