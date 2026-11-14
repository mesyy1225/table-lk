import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";
import { Reveal, RevealGroup, RevealItem, SplitText } from "./motion";

const FeaturedProducts: React.FC = () => {
  const { data: allProducts = [], isLoading } = useProducts();
  const featured = allProducts.filter((p) => p.featured);
  // If nothing is flagged as featured, still show a few tables rather than an empty section.
  const featuredProducts = (featured.length > 0 ? featured : allProducts).slice(0, 8);

  return (
    <section className="section">
      <div className="shell">
        <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
          <SplitText text="Ready to order" className="display-lg" />
          <Reveal className="flex max-w-md flex-col gap-4 md:items-end md:text-right">
            <p className="text-steel">
              Our most ordered office, computer and dining tables. Each comes in several sizes and four top finishes.
            </p>
            <Link to="/shop" className="group inline-flex items-center gap-2 font-semibold">
              <span className="link-draw">See all tables</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {isLoading && featuredProducts.length === 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4" aria-label="Loading tables" role="status">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        ) : (
          <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <RevealItem key={product.id}>
                <ProductCard product={product} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
