import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { EASE_OUT, SplitText } from "./motion";
import { cn } from "@/lib/utils";

const ROTATE_MS = 6500;

/** "TableLK teak-finish dining table on a black steel frame" becomes "Teak-finish dining table on a black steel frame". */
const caption = (alt: string) => {
  const text = alt.replace(/^table\s?lk\s+/i, "").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

/**
 * Home hero. A real table photo fills the first screen and sits behind the header
 * (Layout adds no top offset on "/"). The photos are the admin-managed carousel slides,
 * shown as a fan of sample chips: pick a chip and the photo wipes to that table.
 */
const Hero: React.FC = () => {
  const { get } = useSiteContent();
  const title = get("hero_title", "Tables built to your size.");
  const subtitle = get(
    "hero_subtitle",
    "Melamine tops on powder-coated steel frames, made to order in our Bandaragama workshop and delivered anywhere in Sri Lanka.",
  );
  const { slides } = useHeroSlides();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => {
      setCurrent((cur) => {
        const target = ((next % slides.length) + slides.length) % slides.length;
        if (target !== cur) setPrevious(cur);
        return target;
      });
    },
    [slides.length],
  );

  // Slides can change after loading from the database; keep the index in range.
  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
      setPrevious(null);
    }
  }, [slides.length, current]);

  useEffect(() => {
    if (paused || reduce || slides.length < 2) return;
    const timer = window.setTimeout(() => go(current + 1), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [current, paused, reduce, slides.length, go]);

  // The photo drifts and the text lifts away as the hero scrolls out.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const step = slides.length > 1 ? Math.min(15, 60 / (slides.length - 1)) : 0;
  const active = slides[current] ?? slides[0];

  return (
    <section ref={sectionRef} className="relative flex min-h-hero items-end overflow-hidden bg-ink text-white">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: photoY }}>
        {slides.map((slide, i) => {
          const isCurrent = i === current;
          const isPrevious = i === previous;
          if (!isCurrent && !isPrevious) return null;
          return (
            <motion.div
              key={`${slide.id}-${isCurrent ? "on" : "off"}`}
              className="absolute inset-0"
              style={{ zIndex: isCurrent ? 2 : 1 }}
              initial={isCurrent && previous !== null && !reduce ? { clipPath: "inset(0% 0% 0% 100%)" } : false}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 1.25, ease: EASE_OUT }}
              aria-hidden={!isCurrent}
            >
              <motion.img
                src={slide.image_url}
                alt={isCurrent ? slide.alt : ""}
                className="h-full w-full object-cover"
                style={{ objectPosition: slide.object_position }}
                decoding="async"
                initial={isCurrent && !reduce ? { scale: 1.14 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 2.4, ease: EASE_OUT }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Shade: keeps the header and the headline readable on any photo */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_bottom,hsl(220_10%_6%/0.55)_0%,transparent_22%,transparent_38%,hsl(220_10%_6%/0.82)_100%)]" />

      <motion.div
        className="shell relative z-[4] grid w-full gap-10 pb-10 pt-[calc(var(--header-h)+3rem)] md:pb-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div>
          <SplitText as="h1" text={title} immediate delay={0.15} className="display-xl max-w-[11ch]" />
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.55 }}
            className="mt-6 max-w-[44ch] text-base text-white/85 md:text-lg"
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.68 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/design"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-teak px-7 text-base font-semibold text-ink transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              Design your table
              <ArrowUpRight className="h-[1.125rem] w-[1.125rem] transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/45 px-7 text-base font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-ink active:scale-[0.98]"
            >
              Shop tables
            </Link>
          </motion.div>
        </div>

        {slides.length > 1 && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-end gap-5 pr-16 lg:mr-14 lg:flex-col lg:items-end lg:pr-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {/* The fan: chips hang from one pin, like a board-sample ring */}
            <div
              role="group"
              aria-label="Choose a table photo"
              className="relative h-[8.5rem] w-[9.5rem] shrink-0 lg:h-[12.5rem] lg:w-[15rem]"
            >
              {slides.map((slide, i) => {
                const offset = i - current;
                const isCurrent = offset === 0;
                return (
                  <motion.button
                    key={slide.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show photo ${i + 1} of ${slides.length}: ${caption(slide.alt)}`}
                    aria-pressed={isCurrent}
                    className={cn(
                      "chip absolute bottom-0 left-1/2 h-[7.25rem] w-[5rem] origin-[0.9rem_0.9rem] overflow-hidden bg-ash shadow-chip outline-offset-4 lg:h-[10.5rem] lg:w-[7.25rem]",
                      isCurrent ? "cursor-default" : "cursor-pointer",
                    )}
                    style={{ zIndex: isCurrent ? slides.length + 1 : slides.length - Math.abs(offset), marginLeft: "-0.9rem" }}
                    initial={reduce ? false : { rotate: 0, opacity: 0 }}
                    animate={{
                      rotate: offset * step,
                      opacity: 1,
                      filter: isCurrent ? "brightness(1)" : "brightness(0.72)",
                    }}
                    whileHover={isCurrent ? undefined : { filter: "brightness(0.95)" }}
                    transition={{
                      type: "spring",
                      stiffness: 170,
                      damping: 20,
                      delay: reduce ? 0 : previous === null ? 0.9 + i * 0.06 : 0,
                    }}
                  >
                    <img
                      src={slide.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: slide.object_position }}
                      decoding="async"
                    />
                  </motion.button>
                );
              })}
            </div>
            <p className="min-w-0 max-w-[15rem] text-sm text-white/80 lg:text-right" aria-live="polite">
              <span className="num mb-1 block font-semibold text-white">
                {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
              {caption(active?.alt ?? "")}
            </p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default Hero;
