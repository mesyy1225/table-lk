import { useEffect } from "react";
import { policyConfig } from "@/lib/policyConfig";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const SITE = policyConfig.website.replace(/\/+$/, ""); // https://www.tablelk.com

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

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "TableLK - Premium Office Tables & Furniture Manufacturer in Sri Lanka",
  description = "TableLK - Premium office tables, desks & custom furniture in Sri Lanka. Quality craftsmanship, modern designs, affordable prices. Order now!",
  keywords = "table, office table, desk, furniture, Sri Lanka, TableLK, office furniture, hybrid table, custom furniture",
  ogImage = "/lovable-uploads/e7511338-4de1-4aea-a3be-10f3a6b41823.png",
  canonical,
}) => {
  useEffect(() => {
    document.title = title;

    setMeta('meta[name="description"]', description);
    setMeta('meta[name="keywords"]', keywords);

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
  }, [title, description, keywords, ogImage, canonical]);

  return null;
};

export default SEOHead;
