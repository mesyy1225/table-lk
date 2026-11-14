#!/usr/bin/env node
/**
 * Runs after `vite build`. The site is a single-page app, so without this step every URL
 * serves the same HTML with the home page's title. This script writes a real HTML file for
 * each public page and each product (dist/shop/index.html, dist/product/<id>/index.html ...)
 * carrying that page's own title, description, canonical URL, share image, structured data
 * and a plain-HTML summary for crawlers that do not run JavaScript. It also writes
 * dist/sitemap.xml with every page and product.
 *
 * Page titles and descriptions come from src/lib/seo.json (shared with the React pages).
 * Products are read from Supabase with the public key; if that fails the product pages are
 * skipped and the build still succeeds.
 */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.tablelk.com";
const DIST = path.resolve("dist");
const today = new Date().toISOString().slice(0, 10);

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("seo-build: dist/index.html not found. Run `vite build` first.");
  process.exit(1);
}
const base = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const routes = JSON.parse(fs.readFileSync(path.resolve("src/lib/seo.json"), "utf8"));

/** .env values, with real environment variables (Netlify) taking precedence. */
const env = (() => {
  const out = {};
  try {
    for (const line of fs.readFileSync(path.resolve(".env"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m) out[m[1]] = m[2];
    }
  } catch {
    /* no .env file: rely on process.env */
  }
  return { ...out, ...process.env };
})();

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plain = (s, max = 300) =>
  String(s || "")
    .replace(/[^\p{L}\p{N}\p{P}\p{Zs}\n]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
/** Ends a phrase with a full stop when it has no closing punctuation. */
const sentence = (s) => {
  const t = String(s || "").trim();
  return !t || /[.!?]$/.test(t) ? t : `${t}.`;
};
const rupees = (n) => `Rs. ${Math.round(n).toLocaleString("en-LK")}`;
const abs = (url) => (/^https?:\/\//.test(url) ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`);

const fetchProducts = async () => {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("seo-build: Supabase URL or key missing; product pages skipped.");
    return [];
  }
  try {
    const res = await fetch(`${url}/rest/v1/products?select=*&order=sort_order.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map((r) => {
      const images = (r.images && r.images.length ? r.images : [r.image_url]).filter(Boolean);
      return {
        id: r.id,
        name: r.name,
        short: r.short_description || "",
        description: r.description || "",
        price: Number(r.price) || 0,
        images,
        category: (r.categories && r.categories[0]) || r.category || "Tables",
        material: r.material || "",
        inStock: (r.stock ?? 0) > 0,
        updated: String(r.updated_at || r.created_at || today).slice(0, 10),
      };
    });
  } catch (e) {
    console.warn(`seo-build: products could not be loaded (${e.message}); product pages skipped.`);
    return [];
  }
};

const NAV = [
  ["/", "Home"],
  ["/shop", "Shop tables"],
  ["/design", "Design a table"],
  ["/about", "About"],
  ["/contact", "Contact"],
];

/** Returns the base HTML with this page's head tags, structured data and a no-JavaScript summary. */
const render = ({ route, title, description, image, jsonLd, body }) => {
  const url = `${SITE}${route === "/" ? "/" : route}`;
  let html = base
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="(?:og|twitter):url" content=")[^"]*/g, `$1${url}`)
    .replace(/(<meta property="(?:og|twitter):title" content=")[^"]*/g, `$1${esc(title)}`)
    .replace(/(<meta property="(?:og|twitter):description" content=")[^"]*/g, `$1${esc(description)}`);
  if (image) html = html.replace(/(<meta property="(?:og|twitter):image" content=")[^"]*/g, `$1${esc(abs(image))}`);
  if (jsonLd) {
    const data = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
    html = html.replace("</head>", `  <script type="application/ld+json" id="page-jsonld">${data}</script>\n  </head>`);
  }
  const summary = `<noscript><h1>${esc(title)}</h1><p>${esc(description)}</p>${body || ""}<nav>${NAV.map(
    ([href, label]) => `<a href="${href}">${label}</a>`,
  ).join(" ")}</nav></noscript>`;
  return html.replace('<div id="root"></div>', `<div id="root">${summary}</div>`);
};

const write = (route, html) => {
  const file = route === "/" ? path.join(DIST, "index.html") : path.join(DIST, route, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

const products = await fetchProducts();
const productLinks = products
  .map((p) => `<li><a href="/product/${p.id}">${esc(p.name)}</a> ${rupees(p.price)}</li>`)
  .join("");

// Fixed pages
for (const [route, meta] of Object.entries(routes)) {
  const body = route === "/" || route === "/shop" ? (productLinks ? `<ul>${productLinks}</ul>` : "") : "";
  const jsonLd =
    route === "/shop" && products.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Table LK tables",
          itemListElement: products.slice(0, 50).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: `${SITE}/product/${p.id}`,
          })),
        }
      : undefined;
  write(route, render({ route, title: meta.title, description: meta.description, jsonLd, body }));
}

// Product pages
for (const p of products) {
  const route = `/product/${p.id}`;
  const title = `${p.name} | ${rupees(p.price)} | TableLK Sri Lanka`.slice(0, 70);
  const description = plain(
    `${p.name} for ${rupees(p.price)}. ${sentence(p.short || p.description)} Made in Sri Lanka by TableLK, delivered island-wide.`,
    158,
  );
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      image: p.images.map(abs),
      description: plain(p.short || p.description),
      sku: String(p.id),
      brand: { "@type": "Brand", name: "TableLK" },
      category: p.category,
      ...(p.material ? { material: p.material } : {}),
      offers: {
        "@type": "Offer",
        url: `${SITE}${route}`,
        priceCurrency: "LKR",
        price: Math.round(p.price),
        availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "TableLK" },
        areaServed: "LK",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE}/shop` },
        { "@type": "ListItem", position: 3, name: p.name, item: `${SITE}${route}` },
      ],
    },
  ];
  const body = `${p.images[0] ? `<img src="${esc(abs(p.images[0]))}" alt="${esc(p.name)}" width="600">` : ""}<p>${rupees(
    p.price,
  )}</p><p>${esc(plain(p.description, 1200))}</p>`;
  write(route, render({ route, title, description, image: p.images[0], jsonLd, body }));
}

// Sitemap
const urls = [
  ...Object.entries(routes).map(([route, meta]) => ({
    loc: `${SITE}${route === "/" ? "/" : route}`,
    lastmod: today,
    changefreq: meta.changefreq || "monthly",
    priority: meta.priority || "0.5",
  })),
  ...products.map((p) => ({ loc: `${SITE}/product/${p.id}`, lastmod: p.updated, changefreq: "weekly", priority: "0.8" })),
];
fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`,
);

console.log(`seo-build: ${Object.keys(routes).length} pages, ${products.length} product pages, sitemap with ${urls.length} URLs.`);
