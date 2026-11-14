import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ProductGrid from "@/components/ProductGrid";
import SEOHead from "@/components/SEOHead";
import { Reveal, RevealGroup, RevealItem, SplitText } from "@/components/motion";
import { useProducts } from "@/hooks/useProducts";
import { policyConfig } from "@/lib/policyConfig";

const FACTS = [
  {
    term: "Build",
    detail: "A 15 mm melamine board top on a 1.5″ × 1.5″ powder-coated steel frame, made in our Bandaragama workshop.",
  },
  {
    term: "Delivery",
    detail: `Anywhere in Sri Lanka. Colombo, Gampaha and Kalutara in ${policyConfig.colomboDeliveryDays}; other districts in ${policyConfig.outstationDeliveryDays}.`,
  },
  {
    term: "Payment",
    detail: "Card through PayHere, cash on delivery, or arrange the order on WhatsApp.",
  },
];

/** Placeholder grid shown while the catalogue loads, in the same shape as the real one. */
const GridSkeleton: React.FC = () => (
  <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-12 xl:gap-x-16" role="status" aria-label="Loading tables">
    <div className="hidden space-y-4 lg:block">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-6 animate-pulse rounded-md bg-secondary" style={{ width: `${88 - i * 9}%` }} />
      ))}
    </div>
    <div>
      <div className="h-12 animate-pulse rounded-xl bg-secondary lg:ml-auto lg:w-[30rem]" />
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 border-t border-ink/10 pt-6 md:mt-7 md:grid-cols-3 md:gap-x-6 md:pt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] animate-pulse rounded-xl bg-secondary" />
            <div className="mt-3.5 h-5 w-3/4 animate-pulse rounded-md bg-secondary" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Shop: React.FC = () => {
  const { data: products = [], isLoading } = useProducts();

  return (
    <Layout>
      <SEOHead
        title="Shop Office Tables & Furniture Online - TableLK Sri Lanka"
        description="Buy premium office tables & furniture online at TableLK. Modern desks, custom furniture with island-wide delivery in Sri Lanka. WhatsApp support!"
        keywords="buy table online Sri Lanka, office table price, desk for sale, furniture shop, online furniture store, TableLK shop, hybrid table, ergonomic desk, custom table order"
        canonical={`${policyConfig.website}/shop`}
      />

      {/* A short title so the tables are the first thing on a phone. The header offset comes from Layout. */}
      <header className="shell pb-7 pt-8 md:pb-10 md:pt-14">
        <SplitText as="h1" immediate text="Office, computer and dining tables" className="display-lg max-w-[18ch]" />
        <p className="mt-3 max-w-[52ch] text-steel md:mt-4 md:text-lg">
          Made in our Bandaragama workshop and delivered anywhere in Sri Lanka.
        </p>
      </header>

      <section aria-label="Catalogue" className="shell">
        {isLoading ? <GridSkeleton /> : <ProductGrid products={products} />}
      </section>

      <section className="shell mt-20 md:mt-28">
        <div className="grid gap-10 border-t border-ink/15 pt-12 md:pt-16 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h2 className="display-md max-w-[16ch]">Good to know before you order</h2>
            <p className="mt-4 max-w-[46ch] text-steel">
              Every table here is made to order in our own workshop and sold direct. Custom sizes take{" "}
              {policyConfig.customOrderDays}.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1 font-semibold">
              <Link to="/shipping-policy" className="group inline-flex min-h-11 items-center gap-2">
                <span className="link-draw">Delivery details</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
              </Link>
              <Link to="/return-policy" className="group inline-flex min-h-11 items-center gap-2">
                <span className="link-draw">Returns</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <RevealGroup as="div" stagger={0.1} className="lg:col-span-7">
            <dl className="border-t border-ink/10">
              {FACTS.map((fact) => (
                <RevealItem
                  key={fact.term}
                  className="grid gap-x-6 gap-y-1 border-b border-ink/10 py-5 sm:grid-cols-[8rem_1fr] md:py-6"
                >
                  <dt className="label pt-1 text-steel">{fact.term}</dt>
                  <dd className="max-w-[54ch]">{fact.detail}</dd>
                </RevealItem>
              ))}
            </dl>
          </RevealGroup>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
