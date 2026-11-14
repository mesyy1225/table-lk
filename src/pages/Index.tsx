import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HOME_FAQS, faqLd, routeSeo } from "@/lib/seo";
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
import { Parallax, Reveal, RevealGroup, RevealItem, SplitText, Wipe } from "@/components/motion";
import { supabase } from "@/integrations/supabase/client";
import { policyConfig } from "@/lib/policyConfig";
import { PHOTOS } from "@/lib/photos";
import { FRAME_FINISHES, TOP_FINISHES, type Finish } from "@/lib/finishes";
import { useHomeReviews } from "@/hooks/useCustomerReviews";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const FACTS = [
  { title: "Made in Bandaragama", detail: "Built in our own workshop" },
  { title: "Any size", detail: "Made to order, to the inch" },
  { title: "Workshop prices", detail: "Sold direct, no showroom" },
  { title: "Island-wide delivery", detail: "Card, cash on delivery or WhatsApp" },
];

/** The plain facts, set as one quiet ruled row under the hero. */
const FactsStrip: React.FC = () => (
  <section aria-label="Why Table LK" className="border-b border-ink/10">
    <ul className="shell grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:py-10 lg:grid-cols-4 lg:gap-x-10">
      {FACTS.map((fact) => (
        <li key={fact.title} className="border-l border-ink/15 pl-4">
          <p className="font-semibold leading-snug">{fact.title}</p>
          <p className="mt-1 text-sm text-steel">{fact.detail}</p>
        </li>
      ))}
    </ul>
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
    <section className="mat-ink section overflow-hidden text-white">
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
    <section className="section border-t border-ink/10">
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

/** Questions customers ask before ordering. The same text is published as FAQ data for search engines. */
const FaqSection: React.FC = () => (
  <section className="section border-t border-ink/10">
    <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <SplitText text="Questions before you order" className="display-lg max-w-[12ch]" />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[40ch] text-steel md:text-lg">
            Something else?{" "}
            <Link to="/contact" className="font-semibold text-ink underline decoration-teak-deep underline-offset-4">
              Ask us on the contact page
            </Link>
            .
          </p>
        </Reveal>
      </div>
      <Reveal className="lg:col-span-8">
        <Accordion type="single" collapsible className="border-t border-ink/15">
          {HOME_FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`} className="border-b border-ink/15">
              <AccordionTrigger className="gap-6 py-5 text-left font-display text-lg font-semibold tracking-[-0.015em] hover:no-underline md:text-xl">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-[62ch] pb-6 text-base text-steel">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </div>
  </section>
);

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
    <section className="border-t border-ink/10 bg-secondary/70">
      <div className="shell grid gap-8 py-14 md:py-20 lg:grid-cols-2 lg:items-end lg:gap-16">
        <div>
          <SplitText text="New tables and offers, by email." className="display-lg max-w-[13ch]" />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-[44ch] text-steel md:text-lg">
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
              className="h-14 min-w-0 flex-1 rounded-full border border-input bg-white px-6 text-base text-ink placeholder:text-steel transition-colors duration-300 hover:border-ink/50 focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 font-semibold text-white transition-[transform,background-color] duration-300 ease-out-expo hover:bg-teak-deep active:scale-[0.98] disabled:opacity-70"
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
      <SEOHead {...routeSeo("/")} jsonLd={faqLd(HOME_FAQS)} />
      <Hero />
      <FactsStrip />
      <FeaturedProducts />
      <DesignTeaser />
      <ProcessSection />
      <ReviewsSection />
      <FaqSection />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
