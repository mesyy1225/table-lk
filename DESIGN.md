# Table LK design system

Written from the built site (November 2026). Product truth is in `PRODUCT.md`.

## Idea

The site is the workshop's board-sample book. A customer chooses a table the way they choose a finish: by picking a chip. Colours are the real materials, photos are real Table LK tables, and the copy states sizes, materials, prices and delivery times plainly.

## Colour

Tokens are HSL triplets in `src/index.css`, exposed to Tailwind in `tailwind.config.ts`.

| Token | Value | Use |
|---|---|---|
| `ash` | `80 7% 94%` | Page ground |
| `board` | `0 0% 100%` | Surfaces: fields, cards, panels |
| `ink` | `216 42% 11%` | Text, primary buttons, footer. A deep navy that matches the logo |
| `navy` | `214 58% 22%` | The logo blue |
| `steel` | `216 12% 38%` | Secondary text |
| `teak` | `28 58% 52%` | Brand colour: primary call to action, bands, badges. Text on teak is `ink` |
| `teak-deep` | `24 62% 33%` | Teak for text, links and focus rings on light grounds |
| `teak-tint` | `32 48% 88%` | Hover and accent fill |
| `walnut` | `22 30% 15%` | Dark band |

Material fills: `.mat-teak`, `.mat-walnut`, `.mat-ash`, `.mat-white`, `.mat-black`, `.mat-ink`. On teak or walnut, secondary text is a tint of the ground (`text-ink/75`, `text-white/70`), never grey.

## Type

- Headings: Archivo Variable, bold, tight tracking. Classes `.display-xl` (home hero), `.display-lg` (page and section titles), `.display-md` (sub-sections). Sentence case.
- Everything else: Hanken Grotesk Variable.
- `.label` for small uppercase column and field-group heads. `.num` for tabular numerals on prices, sizes, counts and dates.
- No small label above a heading. Body measure 45 to 70 characters.

## Shape and layout

- `.shell` is the page gutter and max width; `.section` is the vertical rhythm.
- Buttons are pills (`Button` variants: `default` ink, `teak`, `outline`, `ghost`). Fields are 48px high with `rounded-xl`. Photos use `rounded-xl` or `rounded-2xl`.
- Structure comes from hairline rules (`border-ink/10`, `/15`) and space, not boxes. No nested cards.
- `.chip` is the sample chip: a rounded slab with a punched hole, used for finishes and the home photo fan.
- Header height is `--header-h`. `Layout` offsets every page except home with `pt-header`; sticky panels use `top-header`; anchors use `scroll-mt-header`.

## Motion

Primitives live in `src/components/motion.tsx`: `Reveal`, `RevealGroup`/`RevealItem`, `SplitText`, `Wipe`, `Parallax`, `Marquee`. One easing curve, exponential ease-out (`ease-out-expo`), 300 ms for hovers.

- One entrance per section. Task screens (checkout, login, forms, orders, admin) have no scroll entrances, only state transitions and press feedback.
- Signature moments: the hero photo wipe driven by the chip fan, and the live 3D table (`TableScene`) that glides to new sizes and colours.
- Smooth wheel scrolling is Lenis (`SmoothScroll.tsx`). Scrollable overlays need `data-lenis-prevent`.
- Everything respects `prefers-reduced-motion`.

## Content rules

- Real photos only: product images, `src/lib/photos.ts`, or admin uploads.
- Prices through `formatPrice` ("Rs. 18,200"); sizes through `formatSize` ("60 × 24 × 30 in").
- Never invent reviews, ratings, counts, years or guarantees.
