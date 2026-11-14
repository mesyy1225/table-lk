# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: businesses in Sri Lanka fitting out a workspace (offices, institutes, shops) that need several tables, often to a specific size. They compare on price, build quality and delivery time, and usually finish the order by phone or WhatsApp.

Secondary: households buying one desk or dining table for a home office, study, gaming setup or dining room.

## Product Purpose

Table LK (Table LK PVT LTD) makes and sells office, computer, L-shaped, conference and dining tables online at www.tablelk.com. The site must let a visitor see real tables, trust the maker, and place an order by card (PayHere), cash on delivery or WhatsApp. Success is an order or a WhatsApp/phone enquiry.

## Positioning

The maker sells direct: tables are built in Table LK's own workshop in Bandaragama, to the customer's size, top finish and frame colour, at prices below showroom prices, and delivered anywhere in Sri Lanka.

## Operating Context

- Customers browse mostly on phones, often arriving from the Facebook page.
- Ordering paths: card via PayHere, cash on delivery, or a WhatsApp order to +94 72 461 3204.
- Custom-size requests are handled over WhatsApp or the contact form.
- Prices are in Sri Lankan rupees ("Rs.").
- An admin dashboard manages products, orders, messages, the home carousel, customer reviews and users.

## Capabilities and Constraints

- Stack: Vite, React 18, TypeScript, Tailwind, shadcn/ui, framer-motion, Supabase.
- Products, hero slides and customer reviews come from Supabase; a static product list is the fallback.
- Business facts live in `src/lib/policyConfig.ts`.
- Policy pages (terms, privacy, returns, delivery) are required for PayHere approval and must stay reachable from the footer.
- Layout rule (AGENTS.md): the shared fixed-header offset lives in `Layout` for non-home pages; the home slideshow sits behind the header.
- Undecided: real delivery fees, business registration number.

## Brand Commitments

- Name: Table LK / TableLK. Tagline on the current logo: "Smart Tables".
- The logo and colours are open to change (owner's decision, 2026-11-15).
- Chat is Botpress only.

## Evidence on Hand

- Real product photos (cubeupload URLs in `src/hooks/useHeroSlides.ts` and product data).
- Facebook page: https://www.facebook.com/p/Table-Lk-61577878267758/
- Customer reviews are entered by the admin; none exist yet. Do not invent reviews, ratings, customer counts or years in business.

## Product Principles

1. Show the real table. Real workshop photos carry the page; nothing stands in for them.
2. The maker speaks plainly: sizes, materials, price and delivery time are stated, not implied.
3. Ordering takes the shortest path the customer prefers: card, cash on delivery or WhatsApp.
4. Built for a phone first.
