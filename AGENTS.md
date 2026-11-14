Keep the shared fixed-header offset in Layout for non-home pages; the home slideshow intentionally sits behind the header, so page-level top offsets must not duplicate the shared spacing.
The header height is the CSS variable `--header-h` (src/index.css). Layout applies it with `pt-header`; sticky panels use `top-header` and anchor targets use `scroll-mt-header`, never fixed values like `top-20`.

Design system: tokens and utilities in src/index.css and tailwind.config.ts, motion primitives in src/components/motion.tsx, product truth in PRODUCT.md. Use real Table LK photos only (src/lib/photos.ts); format prices with `formatPrice` from src/lib/format.ts.
