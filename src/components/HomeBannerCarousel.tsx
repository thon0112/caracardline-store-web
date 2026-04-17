import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "wouter";
import { cn } from "../cn.js";
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
      className="mb-6 box-border w-screen max-w-[100vw] [margin-left:calc(50%-50vw)]"
      aria-roledescription="carousel"
      aria-label={zhHant.homeBannerAria}
    >
      <div className="relative flex aspect-video h-auto w-full cursor-default select-none flex-col overflow-hidden rounded-none border border-[var(--border)] bg-[var(--media-bg)] box-border md:aspect-auto md:h-[350px] md:rounded-[14px] [-webkit-user-select:none]">
        <div className="min-h-0 w-full flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full w-full items-stretch">
            {emblaSlides.map((b, i) => {
              const logical = i % baseSlideCount;
              const isPrimaryMount =
                i === (heroDesktop && baseSlideCount > 1 ? baseSlideCount : 0);
              const img = (
                <img
                  className="block h-full w-full object-cover object-center transition-transform duration-[350ms] ease-out motion-reduce:transition-none group-hover/slide:md:scale-[1.02] motion-reduce:group-hover/slide:md:scale-100"
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
                  className="relative m-0 h-full min-w-0 w-full shrink-0 grow-0 basis-full overflow-hidden md:me-3 md:h-full md:w-auto md:flex-none md:basis-auto md:aspect-video"
                  aria-hidden={logical !== selectedIndex}
                >
                  {isExternalHref(b.href) ? (
                    <a
                      href={b.href}
                      className="group/slide block h-full w-full leading-none text-inherit no-underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {img}
                    </a>
                  ) : (
                    <Link href={b.href} className="group/slide block h-full w-full leading-none text-inherit no-underline">
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
              className="absolute left-[0.65rem] top-1/2 z-[3] h-9 w-9 -translate-y-1/2 cursor-pointer rounded-full border border-[rgba(28,24,21,0.12)] bg-[rgba(255,255,255,0.82)] p-0 text-[length:0] text-[var(--fg)] backdrop-blur-sm before:block before:text-[1.1rem] before:font-bold before:leading-none before:content-['‹'] hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] hover:text-[var(--accent)] motion-reduce:transition-none"
              aria-label={zhHant.homeBannerPrev}
              onClick={() => goBanner(-1)}
            />
            <button
              type="button"
              className="absolute right-[0.65rem] top-1/2 z-[3] h-9 w-9 -translate-y-1/2 cursor-pointer rounded-full border border-[rgba(28,24,21,0.12)] bg-[rgba(255,255,255,0.82)] p-0 text-[length:0] text-[var(--fg)] backdrop-blur-sm before:block before:text-[1.1rem] before:font-bold before:leading-none before:content-['›'] hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] hover:text-[var(--accent)] motion-reduce:transition-none"
              aria-label={zhHant.homeBannerNext}
              onClick={() => goBanner(1)}
            />
            <div
              className="absolute bottom-[0.85rem] left-0 right-0 z-[3] flex justify-center gap-[0.45rem]"
              role="tablist"
              aria-label={zhHant.homeBannerDots}
            >
              {homeBannerSlides.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === selectedIndex}
                  className={cn(
                    "h-[0.45rem] w-[0.45rem] cursor-pointer rounded-full border-none bg-[rgba(28,24,21,0.22)] p-0 transition-[width,background-color] duration-150",
                    i === selectedIndex && "w-[1.35rem] bg-[var(--accent)]",
                  )}
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
