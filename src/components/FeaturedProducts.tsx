
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getFeaturedProducts } from "@/lib/data";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";

const FeaturedProducts: React.FC = () => {
  const featuredProducts = getFeaturedProducts();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <section className="py-20 bg-secondary/50" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3">
              Our Collection
            </span>
          </motion.div>
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-serif font-bold mb-4"
          >
            Featured Products
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-muted-foreground"
          >
            Discover our most popular and beloved table designs, each crafted with exceptional materials and attention to detail.
          </motion.p>
        </motion.div>

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

        <motion.div 
          variants={itemVariants}
          className="mt-12 text-center"
        >
          <Button asChild size="lg" className="group">
            <Link to="/shop">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
