# Table LK redesign: handoff for page work

You are restyling pages of the Table LK storefront (Vite, React 18, TypeScript, Tailwind, shadcn/ui, framer-motion) to match a design system that is already built. The home page (`src/pages/Index.tsx`, `src/components/Hero.tsx`, `FeaturedProducts.tsx`, `ProductCard.tsx`, `Navbar.tsx`, `Footer.tsx`) is the finished reference. Read those files first and match them.

Read `PRODUCT.md` (who the site is for) and `.impeccable/surfaces/src-pages-index-tsx.md` (the direction). Do not run any impeccable init, concept or direction flow: the direction is decided.

## The direction in one paragraph

The site is the workshop's board-sample book. Colours are the real materials: ash-white board (page ground), white board (surfaces), teak and walnut (brand bands), deep navy ink (text, buttons, footer), with powder-coat black and white as frame finishes. Type is Archivo (headings, bold, professional) and Hanken Grotesk (everything else). Ink is a deep navy that matches the Table LK logo (`ink`, plus `navy` for the logo blue). Shapes are pill buttons, rounded-xl fields, rounded-xl/2xl photos, hairline rules (`border-ink/10` or `/15`) instead of boxes. It speaks plainly, like a maker: sizes, materials, price, delivery time.

## What exists (use it, do not re-invent)

`src/index.css` and `tailwind.config.ts`:
- Layout: `.shell` (page gutter and max width, use instead of `container mx-auto px-6`), `.section` (vertical rhythm).
- Headings: `.display-xl` (hero only), `.display-lg` (section and page titles), `.display-md` (sub-sections). Plain `h1`–`h5` already use the display face.
- `.label` (small uppercase label for field groups, table headers, column heads), `.num` (tabular numerals for prices, sizes, counts, dates).
- `.chip` (sample chip with a punched hole), `.link-draw` (underline that draws in on hover).
- Materials: `.mat-teak`, `.mat-walnut`, `.mat-ash`, `.mat-black`, `.mat-white`.
- Colours (Tailwind): `ash`, `board`, `ink`, `steel` (muted text), `teak`, `teak-deep` (teak for text and focus), `teak-tint`, `walnut`. shadcn tokens (`background`, `foreground`, `primary`, `secondary`, `muted`, `border`, `card`) are mapped onto them. `font-serif` now maps to the display face; prefer removing it from headings since headings already get it.
- Header offset: `--header-h`. Utilities `pt-header`, `top-header` (sticky panels), `scroll-mt-header` (anchor targets). Easing: `ease-out-expo`. Shadows: `shadow-soft`, `shadow-hover`, `shadow-chip`.

`src/components/ui/*`: `Button` is a pill; variants `default` (ink), `teak`, `outline`, `ghost`, `link`; sizes `sm`, `default` (h-11), `lg` (h-12). `Input`, `Textarea`, `SelectTrigger` are h-12 rounded-xl on white. `Card` is rounded-2xl with a hairline border and no shadow.

`src/components/motion.tsx`: `Reveal`, `RevealGroup` + `RevealItem` (stagger), `SplitText` (headline words rise from a mask), `Wipe` (clip-path image reveal), `Parallax`, `Marquee`, `EASE_OUT`. All respect reduced motion.

`src/lib/format.ts`: `formatPrice(n)` gives "Rs. 18,500"; `formatSize(dimensions)` gives "60 × 24 × 30 in". Use these everywhere; remove local "LKR" formatters.
`src/lib/photos.ts`: `PHOTOS`, the real Table LK photos. `src/lib/finishes.ts`: top and frame finishes. `src/components/Logo.tsx`.

## Header overlap (a named bug to fix)

`Layout` already pads every page except `/` by the header height. Pages must not add their own top padding or margin to clear the header. Anything `sticky` must use `top-header` (or `top-[calc(var(--header-h)+1.5rem)]`), never a fixed `top-20`/`top-24`. Anchor targets use `scroll-mt-header`. The header hides on scroll down and returns on scroll up; sticky panels must still look right in both states. Check each of your pages at the top and scrolled, at 1440 and 375 wide, and confirm nothing sits under the header.

## Rules

- Change markup, classes and motion only. Do not change data fetching, form validation, payment, cart or auth logic, routes, Supabase calls, or the meaning of any text that states a fact (prices, policies, delivery times, contact details).
- You may rewrite generic marketing filler in plain words. Never invent reviews, ratings, customer counts, years in business, awards, certifications or guarantees. `product.rating` is a hard-coded 5 and must not be shown as a rating.
- Photos: only product images, `PHOTOS`, or admin-uploaded images. The two `.jpg` files in `public/lovable-uploads` are stock interiors: remove any use of them.
- Do not edit shared files: `src/index.css`, `tailwind.config.ts`, `src/components/motion.tsx`, `Layout.tsx`, `Navbar.tsx`, `Footer.tsx`, `Logo.tsx`, `Hero.tsx`, `FeaturedProducts.tsx`, `ProductCard.tsx`, `src/pages/Index.tsx`, `src/App.tsx`, `src/main.tsx`, `src/components/ui/*`, `src/lib/*`, `package.json`. If you need a change there, say so in your report.
- Do not install packages, start a dev server, use the Browser pane, or commit.

## Craft

- Headings in sentence case. No small label (eyebrow/kicker) above a heading. No gradient text, glass or blur decoration, emoji as icons, coloured side borders, nested cards, or grids of identical icon cards.
- Hierarchy from type size and weight, hairline rules and space, not boxes. More space above a heading than below it. Body text measure 45–70 characters. Muted text is `text-steel`; on teak or walnut bands tint from the ground (`text-ink/75`, `text-white/70`), never grey.
- Every interactive element: hover, focus-visible, active (press) and disabled states; tap targets at least 44px on touch.
- Loading states are skeletons or a small spinner in place; empty states say what to do next; errors say what happened and how to recover.
- Motion with a purpose, 300 ms `ease-out-expo` for hovers, the primitives for entrances. One entrance per section (a staggered group counts as one); never animate every paragraph. Task screens (checkout, login, forms, orders) get no scroll entrances: use only state transitions (AnimatePresence for steps, errors, expanding panels) and press feedback. Animate transform, opacity, clip-path; avoid animating layout properties.
- Phone first. Most customers are on phones. No sideways scroll at 375px.
- Scrollable overlays you build (drawers, panels, long menus) need the attribute `data-lenis-prevent` so the page's smooth scrolling leaves them alone.

## Verify before you report

1. `npx tsc --noEmit -p tsconfig.app.json` must print nothing.
2. The dev server is already running at http://localhost:8080. Take screenshots with
   `node scripts/shot.mjs http://localhost:8080/<route> <your scratch dir>/<name>.png --full` and again with `--mobile --full`, then open each PNG with the Read tool and look at it. Useful flags: `--scroll 800` (one viewport at that scroll position), `--click "<css selector>"`, `--eval "<js>"`, `--wait 4000`. The script prints console errors and whether the page scrolls sideways. Ignore 404s for `hero_slides` and `customer_reviews` (those tables are not created yet).
3. Fix what you see, then look again. Two rounds is enough.

## Report

List the files you changed, what you verified in screenshots (routes and widths), anything you could not do or verify, and any change you need in a shared file.
