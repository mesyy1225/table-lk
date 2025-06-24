
import React from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";

const Index: React.FC = () => {
  return (
    <Layout>
      <SEOHead 
        title="TableLK - Premium Office Tables & Furniture Manufacturer in Sri Lanka"
        description="TableLK - Premium office tables, desks & custom furniture in Sri Lanka. Quality craftsmanship, modern designs, affordable prices. Order now!"
        keywords="table, office table, desk, furniture, Sri Lanka, TableLK, office furniture, hybrid table, custom furniture, wooden table, modern table, ergonomic desk, workspace furniture, commercial furniture, buy table online Sri Lanka"
        canonical="https://tablelk.com"
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
                className="relative h-[600px] rounded-lg overflow-hidden"
              >
                <img
                  alt="TableLK furniture manufacturing workshop in Sri Lanka"
                  className="object-cover h-full w-full"
                  src="/lovable-uploads/bd57dbe4-9301-4540-bddd-af928d6a0a2d.jpg"
                />
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-accent/40">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3">
                Customer Stories
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                What Our Clients Say About TableLK Furniture
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Priya Perera",
                  role: "Office Manager",
                  quote: "The quality of our TableLK office tables is exceptional. The attention to detail and the materials make their pieces stand out in our workspace. Highly recommend for any office furniture needs in Sri Lanka.",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                },
                {
                  name: "Kasun Silva",
                  role: "Business Owner",
                  quote: "I've been purchasing furniture from TableLK for my offices across Colombo. Their tables consistently impress with their quality and style, and they always exceed my expectations with timely delivery.",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                },
                {
                  name: "Chamari Fernando",
                  role: "Interior Designer",
                  quote: "The custom tables I ordered from TableLK are truly works of art. The design details are extraordinary, and they've become centerpieces in my client projects. Best furniture manufacturer in Sri Lanka!",
                  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-lg shadow-soft"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Join Our Newsletter for Latest Furniture Updates
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Subscribe to receive updates on new table collections, special offers, and exclusive furniture deals in Sri Lanka.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-md bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90 transition-colors font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
