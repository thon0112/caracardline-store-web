import { useLayoutEffect } from "react";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  pageCanonical,
} from "./site-seo.js";

export type DocumentMeta = {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "product";
  noindex?: boolean;
};

const HOME_META: DocumentMeta = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  canonicalPath: "/",
  ogImage: DEFAULT_OG_IMAGE,
  ogType: "website",
};

function upsertMetaByName(name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMetaByName(name: string): void {
  document.head.querySelector(`meta[name="${name}"]`)?.remove();
}

function upsertMetaByProperty(property: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applyDocumentMeta(meta: DocumentMeta): void {
  const canonicalUrl = meta.canonicalPath
    ? pageCanonical(meta.canonicalPath)
    : pageCanonical("/");
  const ogImage = meta.ogImage?.trim() || DEFAULT_OG_IMAGE;
  const ogType = meta.ogType ?? "website";

  document.title = meta.title;

  if (meta.description?.trim()) {
    upsertMetaByName("description", meta.description.trim());
  } else {
    removeMetaByName("description");
  }

  if (meta.noindex) {
    upsertMetaByName("robots", "noindex, nofollow");
  } else {
    removeMetaByName("robots");
  }

  upsertCanonical(canonicalUrl);

  upsertMetaByProperty("og:title", meta.title);
  if (meta.description?.trim()) {
    upsertMetaByProperty("og:description", meta.description.trim());
  }
  upsertMetaByProperty("og:url", canonicalUrl);
  upsertMetaByProperty("og:image", ogImage);
  upsertMetaByProperty("og:type", ogType);

  upsertMetaByName("twitter:title", meta.title);
  if (meta.description?.trim()) {
    upsertMetaByName("twitter:description", meta.description.trim());
  }
  upsertMetaByName("twitter:image", ogImage);
}

export function resetDocumentMeta(): void {
  applyDocumentMeta(HOME_META);
}

export function useDocumentMeta(meta: DocumentMeta | null): void {
  useLayoutEffect(() => {
    if (!meta) return;
    applyDocumentMeta(meta);
  }, [
    meta?.title,
    meta?.description,
    meta?.canonicalPath,
    meta?.ogImage,
    meta?.ogType,
    meta?.noindex,
  ]);
}
