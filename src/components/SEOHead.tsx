import { useEffect } from "react";
import { policyConfig } from "@/lib/policyConfig";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  /** schema.org structured data for this page (one object or several). */
  jsonLd?: object | object[];
  /** Keep this page out of search results (checkout, account and result pages). */
  noindex?: boolean;
}

const SITE = policyConfig.website.replace(/\/+$/, ""); // https://www.tablelk.com
const JSON_LD_ID = "page-jsonld";

/**
 * Turns any canonical/og URL into an absolute URL on the canonical www domain:
 * "/shop" -> https://www.tablelk.com/shop, "https://tablelk.com/shop" -> https://www.tablelk.com/shop.
 */
const toCanonicalUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return `${SITE}/`;
  if (trimmed.startsWith("/")) return `${SITE}${trimmed}`;
  try {
    const u = new URL(trimmed);
    if (u.hostname === "tablelk.com" || u.hostname === "www.tablelk.com") {
      const path = u.pathname === "" ? "/" : u.pathname;
      return `${SITE}${path}${u.search}${u.hash}`;
    }
    return trimmed;
  } catch {
    return `${SITE}/${trimmed.replace(/^\/+/, "")}`;
  }
};

const setMeta = (selector: string, content: string) => {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", content);
};

/** Creates the tag when missing, so pages can add a robots rule the base HTML doesn't carry. */
const upsertMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Office Tables in Sri Lanka, Made to Your Size | TableLK",
  description = "Office tables, computer tables and dining tables made in Sri Lanka by TableLK. Custom sizes, workshop prices, island-wide delivery. Order online or on WhatsApp.",
  keywords = "office table Sri Lanka, tables Sri Lanka, computer table, dining table, custom size table, TableLK",
  ogImage = "/lovable-uploads/e7511338-4de1-4aea-a3be-10f3a6b41823.png",
  canonical,
  jsonLd,
  noindex = false,
}) => {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = title;

    setMeta('meta[name="title"]', title);
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="keywords"]', keywords);
    upsertMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    const imageUrl = toCanonicalUrl(ogImage);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', imageUrl);

    // Twitter
    setMeta('meta[property="twitter:title"]', title);
    setMeta('meta[property="twitter:description"]', description);
    setMeta('meta[property="twitter:image"]', imageUrl);

    // Canonical + og:url, always on https://www.tablelk.com
    const canonicalUrl = toCanonicalUrl(canonical ?? window.location.pathname);
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="twitter:url"]', canonicalUrl);

    // Page-level structured data: one script tag, replaced on every page.
    document.getElementById(JSON_LD_ID)?.remove();
    if (jsonLdText) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = JSON_LD_ID;
      script.textContent = jsonLdText;
      document.head.appendChild(script);
    }
  }, [title, description, keywords, ogImage, canonical, jsonLdText, noindex]);

  return null;
};

export default SEOHead;
