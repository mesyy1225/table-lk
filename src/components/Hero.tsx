import { useSiteContent } from "@/hooks/useSiteContent";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView, type Variants } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/policyConfig";

// Real TableLK product photos (landscape shots of finished tables).
const slides = [
  {
    src: "https://u.cubeupload.com/Tablelkk/IMG20250409WA0003.jpg",
    alt: "TableLK L-shaped office table with ash-white top and black steel frame",
    position: "object-[70%_60%]",
  },
  {
    src: "https://u.cubeupload.com/Tablelkk/IMG20250330WA0004.jpg",
    alt: "TableLK teak-finish dining table on a black steel frame",
    position: "object-[60%_50%]",
  },
  {
    src: "https://u.cubeupload.com/Tablelkk/WhatsAppImage2025031.jpg",
    alt: "TableLK smart computer table with black top and white steel frame",
    position: "object-[70%_55%]",
  },
  {
    src: "https://u.cubeupload.com/Tablelkk/IMG20250120WA0011.jpg",
    alt: "TableLK modern L-shaped workstation with teak top and white frame",
    position: "object-[65%_55%]",
  },
];

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.3, staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: EASE },
  },
};

const Hero: React.FC = () => {
  const { get } = useSiteContent();
  const heroTitle = get("hero_title", "Office & Dining Tables, Made in Sri Lanka");
  const heroSubtitle = get(
    "hero_subtitle",
    "Sturdy melamine tops on powder-coated steel frames, built in our Bandaragama workshop and delivered island-wide."
  );
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [controls, isInView]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // The home hero intentionally sits behind the fixed header (Layout adds no top offset on "/"),
  // so the content gets its own top padding to clear the navbar.
  return (
    <section className="relative min-h-[100svh] md:min-h-[600px] flex items-center overflow-hidden bg-neutral-900" ref={ref}>
      {/* Background slideshow */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            aria-hidden={index !== currentSlide}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className={`object-cover w-full h-full ${slide.position}`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
        {/* Dark gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40 md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-black/10" />

        {/* Slide Controls */}
        <div className="absolute bottom-6 left-6 md:left-auto md:bottom-10 md:right-10 flex items-center space-x-2 z-20">
          <button onClick={prevSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white" aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <div className="flex space-x-1">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-4" : "w-2 bg-white/50 hover:bg-white/70"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button onClick={nextSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white" aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* pb-24 on mobile keeps the CTAs clear of the slide controls pinned to the bottom */}
      <div className="container mx-auto px-6 md:px-8 relative z-10 pt-24 pb-24 md:pb-0">
        <motion.div className="max-w-2xl text-white" variants={containerVariants} initial="hidden" animate={controls}>
          <motion.div variants={itemVariants} className="inline-block mb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-white/90">
            Made in Sri Lanka · Island-wide delivery
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-5 [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
            {heroTitle}
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-xl">
            {heroSubtitle}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button size="lg" asChild className="group w-full sm:w-auto">
              <Link to="/shop">
                Shop Tables
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/80 hover:bg-white/20 hover:text-white" asChild>
              <a href={whatsappLink("Hi TableLK, I'd like to order a table")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Order on WhatsApp
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
