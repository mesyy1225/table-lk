
import React from "react";
import Layout from "@/components/Layout";
import ProductGrid from "@/components/ProductGrid";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { getAllProducts } from "@/lib/data";

const Shop: React.FC = () => {
  const products = getAllProducts();
  
  return (
    <Layout>
      <SEOHead 
        title="Shop Office Tables & Furniture Online - TableLK Sri Lanka"
        description="Browse and buy premium office tables, desks, and furniture online at TableLK. Wide selection of modern and custom furniture with island-wide delivery in Sri Lanka. WhatsApp +94 76 902 7347 for instant support."
        keywords="buy table online Sri Lanka, office table price, desk for sale, furniture shop, online furniture store, TableLK shop, hybrid table, ergonomic desk, custom table order"
        canonical="https://tablelk.com/shop"
      />
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }} 
              className="max-w-3xl"
            >
              <h1 className="text-4xl font-serif font-bold mb-4">
                Shop Premium Office Tables & Furniture
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover our complete collection of elegant, durable, and functional furniture for every workspace. Buy online with confidence - island-wide delivery across Sri Lanka.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Products Section */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold mb-4">
                Our Office Table Collection
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                From modern hybrid tables to classic wooden desks, find the perfect furniture piece for your office, home, or commercial space. All tables are manufactured in Sri Lanka with premium materials and expert craftsmanship.
              </p>
            </div>
            <ProductGrid products={products} />
          </div>
        </section>
        
        {/* SEO Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-serif font-bold mb-8">
                Why Choose TableLK for Your Office Furniture?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
                  <p className="text-sm text-muted-foreground">High-grade materials and superior craftsmanship ensure long-lasting furniture.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Custom Orders</h3>
                  <p className="text-sm text-muted-foreground">Bespoke furniture solutions tailored to your specific workspace needs.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
                  <p className="text-sm text-muted-foreground">Quick and reliable delivery service across all regions of Sri Lanka.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">Competitive Prices</h3>
                  <p className="text-sm text-muted-foreground">Best value for money with transparent pricing and no hidden costs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Shop;
