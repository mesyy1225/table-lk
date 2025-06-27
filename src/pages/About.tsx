import React from "react";
import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
const About: React.FC = () => {
  return <Layout>
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="relative bg-primary/10 py-20">
          <div className="container mx-auto px-6 text-center">
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Our Story
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="text-lg text-muted-foreground max-w-2xl mx-auto">Crafting Quality Furniture with Passion, Precision, and Innovation</motion.p>
          </div>
        </div>

        {/* Our Mission */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="order-2 lg:order-1">
                <span className="text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3 block">
                  Our Mission
                </span>
                <h2 className="text-3xl font-serif font-bold mb-6">Crafting Quality, Enhancing Every Space</h2>
                <p className="text-muted-foreground mb-4">At TableLK, our mission is to craft high-quality tables that seamlessly blends functionality, durability, and aesthetic appeal. We are dedicated to creating timeless pieces that enhance homes and workspaces, ensuring comfort, elegance, and lasting value for every customer.</p>
                <p className="text-muted-foreground mb-6">We strive to innovate and refine our craftsmanship, using sustainable materials and advanced techniques to produce furniture that meets modern needs. Our commitment to excellence drives us to deliver superior products while fostering strong relationships with customers, built on trust and satisfaction.</p>
                <Button asChild>
                  <Link to="/shop">
                    Explore Our Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="order-1 lg:order-2 h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <img alt="TableLK fashion collection" className="w-full h-full object-cover" src="/lovable-uploads/c0eda8a5-90aa-4477-a353-8f7c26363615.jpg" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Journey */}
        <section className="py-16 bg-accent/20">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3 block">
                Our Journey
              </span>
              <h2 className="text-3xl font-serif font-bold mb-6">
                From Concept to Creation
              </h2>
              <p className="text-muted-foreground">
                The story of how TableLK came to be and evolved over time to become the brand we are today.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {[{
              year: "2019",
              title: "The Beginning",
              description: "TableLK started as a small workshop crafting high-quality furniture, driven by a passion for exceptional craftsmanship and timeless design."
            }, {
              year: "2020",
              title: "Growing Presence",
              description: "We expanded our product range, reaching more customers and building a strong reputation for durable and elegant furniture."
            }, {
              year: "2021",
              title: "Sustainability Focus",
              description: "We committed to sustainable practices, improving material sourcing and adopting eco-friendly production methods."
            }, {
              year: "2022",
              title: "Going Digital",
              description: "Our online presence grew, making it easier for customers to explore and purchase our furniture from anywhere."
            }, {
              year: "Today",
              title: "A Growing Family",
              description: "TableLK continues to grow, staying true to our values of quality, innovation, and customer satisfaction."
            }].map((milestone, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }} className="flex mb-10 last:mb-0">
                  <div className="mr-6 relative">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {milestone.year}
                    </div>
                    {index < 4 && <div className="absolute w-px h-full bg-primary/20 top-16 left-1/2 transform -translate-x-1/2"></div>}
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3 block">
                Our Team
              </span>
              <h2 className="text-3xl font-serif font-bold mb-6">
                The People Behind TableLK
              </h2>
              <p className="text-muted-foreground">
                Meet our dedicated team committed to bringing you exceptional fashion products.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{
              name: "Jagath Sooriyachchi",
              role: "Founder & Production Supervisor",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
              description: "Jagath's vision and creative direction have shaped TableLK from the beginning."
            }, {
              name: "Radika Madupani",
              role: "Senior Manager",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
              description: "Radika brings years of experience and a unique perspective to our design process."
            }, {
              name: "Kalana Bimsara",
              role: "Sales Manager",
              image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80",
              description: "Kalana ensures that every TableLK product meets our high standards of quality."
            }].map((member, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }} className="bg-accent/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-64 overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-primary/70 font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground">{member.description}</p>
                  </div>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-sm font-semibold tracking-wider uppercase text-primary/70 mb-3 block">
                Our Values
              </span>
              <h2 className="text-3xl font-serif font-bold mb-6">
                What Drives Us
              </h2>
              <p className="text-muted-foreground">
                The core principles that guide everything we do at TableLK.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{
              title: "Quality",
              description: "We never compromise on quality, selecting the finest materials and maintaining high standards in our production."
            }, {
              title: "Sustainability",
              description: "We're committed to responsible practices, minimizing environmental impact throughout our operations."
            }, {
              title: "Community",
              description: "We value the relationships we build with our customers, suppliers, and community partners."
            }, {
              title: "Innovation",
              description: "We constantly explore new ideas, materials, and techniques to improve our products."
            }, {
              title: "Integrity",
              description: "We conduct business with honesty and transparency, building trust with everyone we work with."
            }, {
              title: "Inclusivity",
              description: "We design for everyone, celebrating diversity and creating products that can be enjoyed by all."
            }].map((value, index) => <motion.div key={index} initial={{
              opacity: 0,
              scale: 0.95
            }} whileInView={{
              opacity: 1,
              scale: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.4,
              delay: index * 0.05
            }} className="bg-white p-8 rounded-lg border border-accent/20">
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Join the TableLK Community
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8">
                Discover our collection and experience the TableLK difference for yourself.
              </p>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/shop">Shop Collection</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>;
};
export default About;