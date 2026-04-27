declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const DEFAULT_PROD_MEASUREMENT_ID = "G-F5BZJRS274";

function measurementId(): string | undefined {
  const fromEnv = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return DEFAULT_PROD_MEASUREMENT_ID;
  return undefined;
}

let initStarted = false;
let scriptReady = false;
const pendingPageViews: Array<{ path: string; title?: string }> = [];

function flushPendingPageViews(): void {
  const gtag = window.gtag;
  if (!gtag) return;
  for (const { path, title } of pendingPageViews) {
    gtag("event", "page_view", {
      page_path: path,
      page_title: title ?? document.title,
      page_location: `${window.location.origin}${path}`,
    });
  }
  pendingPageViews.length = 0;
}

export function initGoogleAnalytics(): void {
  const id = measurementId();
  if (!id || initStarted) return;
  initStarted = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("js", new Date());

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.onload = () => {
    window.gtag?.("config", id, { send_page_view: false, debug_mode: true });
    scriptReady = true;
    flushPendingPageViews();
  };
  document.head.appendChild(script);
}

export function trackPageView(path: string, title?: string): void {
  if (!measurementId()) return;

  if (scriptReady && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title ?? document.title,
      page_location: `${window.location.origin}${path}`,
    });
    return;
  }

  pendingPageViews.push({ path, title });
}
