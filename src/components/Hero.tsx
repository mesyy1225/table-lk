import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Updated slideshow images with better furniture images
const slideImages = ["https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=958&q=80", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"];
const Hero: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slideImages.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slideImages.length) % slideImages.length);
  };
  return <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden" ref={ref}>
      {/* Background Image with Slideshow */}
      <div className="absolute inset-0 w-full h-full">
        {slideImages.map((image, index) => <div key={index} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
            <img src={image} alt={`Furniture slideshow ${index + 1}`} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
          </div>)}
        
        {/* Slide Controls */}
        <div className="absolute bottom-10 right-10 flex items-center space-x-2 z-20">
          <button onClick={prevSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white" aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <div className="flex space-x-1">
            {slideImages.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-4" : "bg-white/50 hover:bg-white/70"}`} aria-label={`Go to slide ${index + 1}`}></button>)}
          </div>
          <button onClick={nextSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white" aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <motion.div className="max-w-2xl text-white" variants={containerVariants} initial="hidden" animate={controls}>
          <div className="mb-6">
            <img alt="TableLK Logo" className="h-20 md:h-24 w-auto object-contain" src="/lovable-uploads/e7511338-4de1-4aea-a3be-10f3a6b41823.png" />
          </div>
          
          <motion.div variants={itemVariants} className="inline-block mb-3 text-sm font-semibold tracking-wider uppercase bg-primary/30 backdrop-blur-sm px-3 py-1 rounded-full text-primary-foreground/90">CRAFTED FOR COMFORT</motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight mb-6">
            Elegance in <br />
            Every Detail
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
            Each TableLK creation is a masterpiece, crafted with premium materials and meticulous attention to detail.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Button size="lg" asChild className="group">
              <Link to="/shop">
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white/80 hover:bg-white/10" asChild>
              <Link to="/about">Our Story</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-floatUp">
        <div className="text-white/80 text-sm font-medium mb-2">Scroll</div>
        <div className="w-px h-8 bg-gradient-to-b from-white/80 to-transparent"></div>
      </div>
    </section>;
};
export default Hero;