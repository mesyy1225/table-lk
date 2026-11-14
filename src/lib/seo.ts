/**
 * Search-engine helpers: page titles and descriptions (seo.json, also read by
 * scripts/seo-build.mjs at build time) and schema.org structured data.
 * Everything here states facts from policyConfig and the product data; nothing is invented.
 */
import routes from "./seo.json";
import { policyConfig } from "./policyConfig";
import type { Product } from "./data";

const SITE = policyConfig.website.replace(/\/+$/, "");

type RouteSeo = { title: string; description: string };

/** Title, description and canonical URL for a fixed route such as "/shop". */
export const routeSeo = (path: keyof typeof routes) => {
  const { title, description } = routes[path] as RouteSeo;
  return { title, description, canonical: `${SITE}${path === "/" ? "/" : path}` };
};

export const absoluteUrl = (url: string) => (/^https?:\/\//.test(url) ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`);

/** Questions customers ask before ordering. Shown on the home page and marked up as FAQ data. */
export const HOME_FAQS = [
  {
    q: "Do you deliver tables everywhere in Sri Lanka?",
    a: `Yes. We deliver to every district. Colombo, Gampaha and Kalutara take ${policyConfig.colomboDeliveryDays}; other districts take ${policyConfig.outstationDeliveryDays}.`,
  },
  {
    q: "Can I order an office table in a custom size?",
    a: `Yes. Every table is made to order, so you can give us the exact length, width and height. Set the size in the 3D designer or message us on WhatsApp. Custom sizes take ${policyConfig.customOrderDays} to build.`,
  },
  {
    q: "What are Table LK tables made of?",
    a: "A 15 mm melamine board top on a 1.5 inch by 1.5 inch powder-coated steel frame. Tops come in teak, American ash white, white and black, and frames in black or white.",
  },
  {
    q: "How can I pay?",
    a: "By credit or debit card through PayHere, by cash on delivery, or by arranging the order with us on WhatsApp.",
  },
  {
    q: "Can I return a table?",
    a: `Standard tables can be returned within ${policyConfig.returnWindowDays} days of delivery, and damage or a wrong item should be reported within ${policyConfig.damageReportHours} hours. The Return & Refund Policy has the details.`,
  },
  {
    q: "Do you supply tables for a whole office?",
    a: "Yes. Send us the sizes and quantities on WhatsApp or through the contact page and we will reply with a price for the order.",
  },
];

export const faqLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

/** Strips the emoji bullets used in product descriptions and collapses whitespace. */
const plainText = (text: string, max = 300) =>
  text
    .replace(/[^\p{L}\p{N}\p{P}\p{Zs}\n]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/** Ends a phrase with a full stop when it has no closing punctuation. */
const sentence = (text: string) => {
  const t = text.trim();
  return !t || /[.!?]$/.test(t) ? t : `${t}.`;
};

type ReviewLike = { customer_name: string; rating: number; review: string; review_date: string };

/** Product data for Google's product results. Ratings appear only when real customer reviews exist. */
export const productLd = (product: Product, reviews: ReviewLike[] = []) => {
  const url = absoluteUrl(`/product/${product.id}`);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.filter((src) => src && !src.includes("placeholder")).map(absoluteUrl),
    description: plainText(product.shortDescription || product.description),
    sku: String(product.id),
    brand: { "@type": "Brand", name: policyConfig.brandName },
    category: product.categories[0] || "Tables",
    ...(product.material ? { material: product.material } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "LKR",
      price: Math.round(product.price),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: policyConfig.brandName },
      areaServed: "LK",
    },
  };
  if (reviews.length > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length,
    };
    ld.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customer_name },
      datePublished: r.review_date,
      reviewBody: r.review,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    }));
  }
  return ld;
};

/** The catalogue as a list, for the shop page. */
export const itemListLd = (products: Product[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Table LK tables",
  itemListElement: products.slice(0, 50).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: absoluteUrl(`/product/${p.id}`),
  })),
});

export const productSeo = (product: Product) => {
  const price = `Rs. ${Math.round(product.price).toLocaleString("en-LK")}`;
  return {
    title: `${product.name} | ${price} | TableLK Sri Lanka`.slice(0, 70),
    description: plainText(
      `${product.name} for ${price}. ${sentence(product.shortDescription || product.description)} Made in Sri Lanka by TableLK, delivered island-wide.`,
      158,
    ),
    canonical: absoluteUrl(`/product/${product.id}`),
  };
};
