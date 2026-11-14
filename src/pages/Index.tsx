import React, { lazy, Suspense, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Facebook, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import SEOHead from "@/components/SEOHead";
import TableSketch from "@/components/TableSketch";

// three.js is large: the 3D model loads only when this section scrolls into view.
const TableScene = lazy(() => import("@/components/TableScene"));
import ReviewCard, { Stars } from "@/components/ReviewCard";
import { Marquee, Parallax, Reveal, RevealGroup, RevealItem, SplitText, Wipe } from "@/components/motion";
import { supabase } from "@/integrations/supabase/client";
import { policyConfig } from "@/lib/policyConfig";
import { PHOTOS } from "@/lib/photos";
import { FRAME_FINISHES, TOP_FINISHES, type Finish } from "@/lib/finishes";
import { useHomeReviews } from "@/hooks/useCustomerReviews";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const FACTS = [
  "Made in our Bandaragama workshop",
  "Any size, made to order",
  "Workshop prices, sold direct",
  "Delivered anywhere in Sri Lanka",
  "Card, cash on delivery or WhatsApp",
];

/** Moving strip of the plain facts, printed on teak. */
const FactsStrip: React.FC = () => (
  <section aria-label="Why Table LK" className="mat-teak border-y border-ink/15 text-ink">
    <Marquee duration={44} className="py-4 md:py-5">
      {FACTS.map((fact) => (
        <span key={fact} className="flex items-center font-display text-lg font-semibold tracking-[-0.02em] md:text-[1.375rem]">
          <span className="whitespace-nowrap px-6 md:px-9">{fact}</span>
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-ink/70" />
        </span>
      ))}
    </Marquee>
  </section>
);

const FinishChip: React.FC<{ finish: Finish; selected: boolean; onSelect: () => void; group: string }> = ({
  finish,
  selected,
  onSelect,
  group,
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    aria-label={`${group}: ${finish.name}`}
    onClick={onSelect}
    className={cn(
      "group/chip flex w-[4.4rem] flex-col gap-2 text-left sm:w-[5.25rem] outline-offset-4 transition-transform duration-500 ease-out-expo md:w-24",
      selected ? "-translate-y-2" : "hover:-translate-y-1",
    )}
  >
    <span
      className={cn("chip block h-[6.5rem] w-full border border-white/20 shadow-chip md:h-28", finish.mat)}
      style={{ outline: selected ? "2px solid hsl(var(--teak))" : "none", outlineOffset: 3 }}
    />
    <span className={cn("text-[0.8125rem] font-medium leading-tight transition-colors duration-300", selected ? "text-white" : "text-white/60")}>
      {finish.name}
    </span>
  </button>
);

/** Walnut band: choose a top and a frame, watch the drawing change, then open the 3D designer. */
const DesignTeaser: React.FC = () => {
  const [top, setTop] = useState(TOP_FINISHES[0]);
  const [frame, setFrame] = useState(FRAME_FINISHES[0]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(sceneRef, { once: true, margin: "300px" });
  const spec = useMemo(
    () => ({ length: 60, width: 24, height: 30, topHex: top.hex, topGrain: top.grain, frameHex: frame.hex, legs: "loop" as const }),
    [top, frame],
  );
  const sketch = <TableSketch top={top.hex} frame={frame.hex} className="h-full w-full" />;

  return (
    <section className="mat-walnut section overflow-hidden text-white">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SplitText text="Pick a top. Pick a frame. Give us the size." className="display-lg max-w-[14ch]" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[46ch] text-white/75 md:text-lg">
              Every Table LK table is made to order, so the size is yours to set. Try a finish here, then open the
              3D designer to set the length, width and height and send us the order.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-10 space-y-8">
            <div role="radiogroup" aria-label="Top finish">
              <h3 className="label mb-4 text-white/55">Top</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-6 pt-2 sm:gap-x-4">
                {TOP_FINISHES.map((f) => (
                  <FinishChip key={f.id} finish={f} group="Top" selected={f.id === top.id} onSelect={() => setTop(f)} />
                ))}
              </div>
            </div>
            <div role="radiogroup" aria-label="Frame colour">
              <h3 className="label mb-4 text-white/55">Frame</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-6 pt-2 sm:gap-x-4">
                {FRAME_FINISHES.map((f) => (
                  <FinishChip key={f.id} finish={f} group="Frame" selected={f.id === frame.id} onSelect={() => setFrame(f)} />
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.26} className="mt-10">
            <Link
              to={`/design?top=${top.id}&frame=${frame.id}`}
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-teak px-7 text-base font-semibold text-ink transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Open the 3D designer
              <ArrowUpRight className="h-[1.125rem] w-[1.125rem] transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal y={48} className="relative">
          <div ref={sceneRef} className="mx-auto aspect-[4/3] w-full max-w-[40rem]">
            {sceneInView ? (
              <Suspense fallback={sketch}>
                <TableScene spec={spec} autoRotate />
              </Suspense>
            ) : (
              sketch
            )}
          </div>
          <p className="mt-2 text-center text-sm text-white/60" aria-live="polite">
            {top.name} top on a {frame.name.toLowerCase()} frame · drag to turn
          </p>
        </Reveal>
      </div>
    </section>
  );
};

const STEPS = [
  {
    title: "Choose a table, or design one",
    body: "Pick an office, computer or dining table from the catalogue, or set your own size, top and frame in the designer.",
  },
  {
    title: "We build it in Bandaragama",
    body: `A 15 mm melamine board top on a 1.5″ × 1.5″ powder-coated steel frame, cut and welded in our own workshop. Custom sizes take ${policyConfig.customOrderDays}.`,
  },
  {
    title: "It arrives at your door",
    body: `Colombo, Gampaha and Kalutara in ${policyConfig.colomboDeliveryDays}; other districts in ${policyConfig.outstationDeliveryDays}. Pay by card, cash on delivery, or arrange it on WhatsApp.`,
  },
];

/** How an order goes, beside a photo of the workshop. */
const ProcessSection: React.FC = () => (
  <section className="section">
    <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-6">
        <Wipe className="aspect-[4/5] rounded-2xl sm:aspect-[5/4] lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:aspect-[4/5]">
          <Parallax amount={70} className="h-[116%] w-full -translate-y-[8%]">
            <img
              src={PHOTOS.workshop}
              alt="An L-shaped office table on the Table LK workshop floor in Bandaragama"
              className="h-full w-full object-cover object-[35%_40%]"
              loading="lazy"
              decoding="async"
            />
          </Parallax>
        </Wipe>
      </div>

      <div className="lg:col-span-6 lg:py-6">
        <SplitText text="From our workshop floor to your office." className="display-lg max-w-[13ch]" />
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-[52ch] text-steel md:text-lg">
            Table LK makes office tables, computer tables and dining tables in Sri Lanka and sells them direct. No
            showroom sits between you and the people who build your table, which is why the price is lower and the
            size can be anything you need.
          </p>
        </Reveal>

        <RevealGroup as="ol" stagger={0.12} className="mt-12 border-t border-ink/15">
          {STEPS.map((step, i) => (
            <RevealItem as="li" key={step.title} className="grid grid-cols-[3.25rem_1fr] gap-x-4 border-b border-ink/15 py-7 md:grid-cols-[5rem_1fr] md:py-9">
              <span className="num font-display text-4xl font-bold leading-none text-teak-deep md:text-5xl" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl md:text-2xl">{step.title}</h3>
                <p className="mt-2 max-w-[48ch] text-steel">{step.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-semibold">
          <Link to="/about" className="group inline-flex items-center gap-2">
            <span className="link-draw">About the workshop</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
          </Link>
          <Link to="/shipping-policy" className="group inline-flex items-center gap-2">
            <span className="link-draw">Delivery details</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </div>
  </section>
);

/** Customer reviews managed in Admin → Reviews, with a link to the Facebook page. */
const ReviewsSection: React.FC = () => {
  const { data: reviews = [] } = useHomeReviews();
  const { data: products = [] } = useProducts();
  const productName = (id: string | null) => (id ? products.find((p) => String(p.id) === id)?.name : undefined);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const facebookLink = (
    <a
      href={policyConfig.facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink/25 px-6 font-semibold transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white"
    >
      <Facebook className="h-[1.125rem] w-[1.125rem]" />
      {reviews.length ? "More reviews on Facebook" : "Read our reviews on Facebook"}
    </a>
  );

  return (
    <section className="section border-t border-ink/10 bg-secondary/60">
      <div className="shell">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <SplitText text="What customers say" className="display-lg" />
            <Reveal delay={0.1} className="mt-5">
              {reviews.length > 0 ? (
                <div className="flex items-center gap-3 text-steel">
                  <Stars rating={Math.round(average)} />
                  <span className="num">
                    {average.toFixed(1)} from {reviews.length} review{reviews.length > 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <p className="max-w-[48ch] text-steel md:text-lg">
                  Customers across Sri Lanka post their tables and reviews on our Facebook page.
                </p>
              )}
            </Reveal>
          </div>
          <Reveal delay={0.15}>{facebookLink}</Reveal>
        </div>

        {reviews.length > 0 && (
          <RevealGroup className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {reviews.map((r) => (
              <RevealItem key={r.id}>
                <ReviewCard review={r} productName={productName(r.product_id)} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type NewsletterStatus = "idle" | "loading" | "success" | "duplicate" | "error";

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value) || value.length > 254) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    setValidationError("");
    setStatus("loading");
    const { error } = await (supabase as any).from("newsletter_subscribers").insert({ email: value });
    if (!error) {
      setStatus("success");
      setEmail("");
    } else if (error.code === "23505") {
      setStatus("duplicate");
      setEmail("");
    } else {
      setStatus("error");
    }
  };

  const message =
    validationError ||
    (status === "success"
      ? "Thanks for subscribing. We'll email you about new tables and offers."
      : status === "duplicate"
        ? "You're already subscribed. Thank you."
        : status === "error"
          ? "That didn't go through. Please try again in a moment."
          : "");

  return (
    <section className="mat-teak text-ink">
      <div className="shell grid gap-8 py-14 md:py-20 lg:grid-cols-2 lg:items-end lg:gap-16">
        <div>
          <SplitText text="New tables and offers, by email." className="display-lg max-w-[13ch]" />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-[44ch] text-ink/80 md:text-lg">
              A short email when we add a table or run an offer. Nothing else.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationError) setValidationError("");
                if (status !== "idle" && status !== "loading") setStatus("idle");
              }}
              aria-invalid={!!validationError}
              aria-describedby="newsletter-status"
              className="h-14 min-w-0 flex-1 rounded-full border border-ink/35 bg-white/25 px-6 text-base text-ink placeholder:text-ink/60 transition-colors duration-300 focus:border-ink focus:bg-white/45 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 font-semibold text-white transition-[transform,background-color] duration-300 ease-out-expo hover:bg-walnut active:scale-[0.98] disabled:opacity-70"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subscribing
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
          <p id="newsletter-status" role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] px-6 text-sm font-medium text-ink">
            {message}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

const Index: React.FC = () => {
  return (
    <Layout>
      <SEOHead
        title="TableLK - Premium Office Tables & Furniture Manufacturer in Sri Lanka"
        description="TableLK - Premium office tables, desks & custom furniture in Sri Lanka. Quality craftsmanship, modern designs, affordable prices. Order now!"
        keywords="table, office table, desk, furniture, Sri Lanka, TableLK, office furniture, hybrid table, custom furniture, wooden table, modern table, ergonomic desk, workspace furniture, commercial furniture, buy table online Sri Lanka"
        canonical={`${policyConfig.website}/`}
      />
      <Hero />
      <FactsStrip />
      <FeaturedProducts />
      <DesignTeaser />
      <ProcessSection />
      <ReviewsSection />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
