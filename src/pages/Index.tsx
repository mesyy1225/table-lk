
import React, { useState } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Facebook, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { policyConfig } from "@/lib/policyConfig";
import ReviewCard, { Stars } from "@/components/ReviewCard";
import { useHomeReviews } from "@/hooks/useCustomerReviews";
import { useProducts } from "@/hooks/useProducts";

const ReviewsSection: React.FC = () => {
  const { data: reviews = [] } = useHomeReviews();
  const { data: products = [] } = useProducts();
  const productName = (id: string | null) => (id ? products.find((p) => String(p.id) === id)?.name : undefined);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <section className="py-16 md:py-20 bg-accent/40">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-12">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3">
            Customer reviews
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">See what our customers say</h2>
          {reviews.length > 0 ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Stars rating={Math.round(average)} />
              <span>
                {average.toFixed(1)} from {reviews.length} review{reviews.length > 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Read honest reviews and see photos from TableLK customers across Sri Lanka on our Facebook page.
            </p>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 items-start">
            {reviews.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.08 }}
                viewport={{ once: true }}
              >
                <ReviewCard review={r} productName={productName(r.product_id)} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button size="lg" variant={reviews.length ? "outline" : "default"} asChild>
            <a href={policyConfig.facebookUrl} target="_blank" rel="noopener noreferrer">
              <Facebook className="mr-2 h-5 w-5" />
              {reviews.length ? "More reviews on Facebook" : "Read our reviews on Facebook"}
            </a>
          </Button>
        </div>
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
      ? "Thanks for subscribing! We'll email you about new tables and offers."
      : status === "duplicate"
        ? "You're already subscribed. Thank you!"
        : status === "error"
          ? "Sorry, something went wrong. Please try again in a moment."
          : "");

  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Join Our Newsletter for Latest Furniture Updates
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Subscribe to receive updates on new table collections, special offers, and exclusive furniture deals in Sri Lanka.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={handleSubmit} noValidate>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
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
              className="flex-1 min-w-0 px-4 py-3 rounded-md bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90 transition-colors font-medium disabled:opacity-70"
            >
              {status === "loading" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subscribing...</>) : "Subscribe"}
            </button>
          </form>
          <p id="newsletter-status" role="status" aria-live="polite" className="mt-4 min-h-[1.5rem] text-sm text-primary-foreground/90">
            {message}
          </p>
        </div>
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
      <div>
        {/* Hero Section - removed padding */}
        <Hero />
        
        {/* Featured Products Section */}
        <FeaturedProducts />
        
        {/* SEO Content Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-bold mb-6 text-center">
                Premium Tables and Office Furniture in Sri Lanka
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-4">
                  Looking for high-quality <strong>office tables</strong> and <strong>furniture in Sri Lanka</strong>? TableLK is your trusted partner for premium workspace solutions. We specialize in manufacturing <strong>hybrid office tables</strong>, <strong>ergonomic desks</strong>, and <strong>custom furniture</strong> that combines functionality with elegant design.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our <strong>office tables</strong> are crafted using the finest materials and modern manufacturing techniques. Whether you need a single <strong>desk</strong> for your home office or bulk <strong>office furniture</strong> for your business, TableLK delivers exceptional quality at competitive prices across Sri Lanka.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">Custom Tables</h3>
                    <p className="text-sm text-muted-foreground">Bespoke office tables designed to your exact specifications and workspace requirements.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">Quality Materials</h3>
                    <p className="text-sm text-muted-foreground">Premium wood and metal components ensuring durability and long-lasting performance.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">Island-wide Delivery</h3>
                    <p className="text-sm text-muted-foreground">Fast and reliable delivery of office furniture across all regions of Sri Lanka.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Craftsmanship Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary/70">
                  Our Process
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold">
                  Exceptional Quality in Every Detail
                </h2>
                <p className="text-muted-foreground">
                  At TableLK, we follow a meticulous process to craft high-quality furniture that blends durability with elegance. From selecting the finest raw materials to precision cutting and expert assembly, every step is handled with care to ensure exceptional craftsmanship and long-lasting value.
                </p>
                <p className="text-muted-foreground">
                  Our team of skilled artisans and designers work together to bring your vision to life. Using advanced techniques and quality finishes, we create furniture that meets both aesthetic and functional needs. Every piece undergoes strict quality checks before reaching your space, ensuring perfection in every detail.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div>
                    <h3 className="font-medium text-xl mb-2">Quality Materials</h3>
                    <p className="text-sm text-muted-foreground">
                      We source our materials from responsible suppliers committed to sustainable practices.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-xl mb-2">Expert Craftsmanship</h3>
                    <p className="text-sm text-muted-foreground">
                      Every product is meticulously crafted with attention to detail and quality.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative h-[360px] sm:h-[480px] lg:h-[600px] rounded-lg overflow-hidden"
              >
                <img
                  alt="TableLK furniture manufacturing workshop in Sri Lanka"
                  className="object-cover h-full w-full"
                  loading="lazy"
                  src="/lovable-uploads/bd57dbe4-9301-4540-bddd-af928d6a0a2d.jpg"
                />
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Customer reviews: managed in Admin → Reviews, with a link to Facebook */}
        <ReviewsSection />

        {/* Newsletter Section */}
        <NewsletterSection />
      </div>
    </Layout>
  );
};

export default Index;
