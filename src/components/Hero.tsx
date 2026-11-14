import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { EASE_OUT, SplitText } from "./motion";

const ROTATE_MS = 6500;

const arrowButton =
  "flex h-11 w-11 items-center justify-center rounded-full border border-white/35 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-ink active:scale-95";

/** "TableLK teak-finish dining table on a black steel frame" becomes "Teak-finish dining table on a black steel frame". */
const caption = (alt: string) => {
  const text = alt.replace(/^table\s?lk\s+/i, "").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

/**
 * Home hero. A real table photo fills the first screen and sits behind the header
 * (Layout adds no top offset on "/"). The photos are the admin-managed carousel slides,
 * with one slim progress line per photo: pick a line, use the arrows, or swipe, and the photo wipes across.
 */
const Hero: React.FC = () => {
  const { get } = useSiteContent();
  const title = get("hero_title", "Office tables built to your size.");
  const subtitle = get(
    "hero_subtitle",
    "Office, computer and dining tables made to order in our Bandaragama workshop and delivered anywhere in Sri Lanka.",
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

  const active = slides[current] ?? slides[0];

  return (
    <motion.section
      ref={sectionRef}
      className="relative flex min-h-hero touch-pan-y items-end overflow-hidden bg-ink text-white"
      onPanEnd={(_, info) => {
        // A sideways swipe changes the photo; up-and-down swipes scroll the page as usual.
        if (slides.length < 2 || Math.abs(info.offset.x) < 56 || Math.abs(info.offset.x) < Math.abs(info.offset.y) * 1.5) return;
        go(current + (info.offset.x < 0 ? 1 : -1));
      }}
    >
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
                // React 18 only passes this through in lowercase; it marks the first photo as the page's main image.
                {...(i === 0 ? ({ fetchpriority: "high" } as object) : {})}
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
          <SplitText as="h1" text={title} immediate delay={0.15} className="display-xl max-w-[9.5em]" />
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
            className="pr-16 lg:w-[21rem] lg:pr-14"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <p className="mb-3 hidden text-sm text-white/75 lg:block" aria-live="polite">
              {caption(active?.alt ?? "")}
            </p>
            <div className="flex items-center gap-4">
              <span className="num shrink-0 text-sm font-semibold text-white">
                {String(current + 1).padStart(2, "0")}
                <span className="text-white/50"> / {String(slides.length).padStart(2, "0")}</span>
              </span>
              {/* One line per photo; the current line fills as its time runs. */}
              <div role="group" aria-label="Choose a table photo" className="flex flex-1 items-center gap-1.5">
                {slides.map((slide, i) => {
                  const isCurrent = i === current;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Show photo ${i + 1} of ${slides.length}: ${caption(slide.alt)}`}
                      aria-current={isCurrent}
                      className="group/line flex h-11 flex-1 items-center"
                    >
                      <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-white/30 transition-colors duration-300 group-hover/line:bg-white/55">
                        {isCurrent && (
                          <motion.span
                            key={`${current}-${paused ? "hold" : "run"}`}
                            className="absolute inset-0 origin-left bg-white"
                            initial={{ scaleX: paused || reduce ? 1 : 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: paused || reduce ? 0 : ROTATE_MS / 1000, ease: "linear" }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="hidden shrink-0 gap-2 lg:flex">
                <button type="button" onClick={() => go(current - 1)} aria-label="Previous photo" className={arrowButton}>
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => go(current + 1)} aria-label="Next photo" className={arrowButton}>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  );
};

export default Hero;
