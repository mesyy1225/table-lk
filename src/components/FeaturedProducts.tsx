import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useAnimation, useInView, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.2, staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

const FeaturedProducts: React.FC = () => {
  const { data: allProducts = [], isLoading } = useProducts();
  const featured = allProducts.filter((p) => p.featured);
  // If nothing is flagged as featured, still show a few tables rather than an empty section.
  const featuredProducts = (featured.length > 0 ? featured : allProducts).slice(0, 8);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [controls, isInView]);

  return (
    <section className="py-16 md:py-20 bg-secondary/50" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div variants={containerVariants} initial="hidden" animate={controls} className="text-center mb-10 md:mb-12">
          <motion.div variants={itemVariants}>
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3">
              Our Collection
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Featured Tables
          </motion.h2>
          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground">
            Our most popular office, study and dining tables, available in several sizes and finishes.
          </motion.p>
        </motion.div>

        {isLoading && featuredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">Loading tables...</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          >
            {featuredProducts.map((product, index) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="mt-10 md:mt-12 text-center">
          <Button asChild size="lg" className="group">
            <Link to="/shop">
              View all tables
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
