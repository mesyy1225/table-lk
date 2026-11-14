/**
 * Shared motion primitives for the storefront.
 * One easing curve (exponential ease-out) and a small set of entrances, so
 * pages feel like one system. All of them respect "prefers-reduced-motion".
 */
import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /** Distance travelled in px. */
  y?: number;
  as?: "div" | "section" | "li" | "article";
};

/** Rise-and-fade entrance, played once when the element scrolls into view. */
export const Reveal: React.FC<RevealProps> = ({ delay = 0, y = 28, as = "div", children, ...rest }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const groupVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

type GroupProps = HTMLMotionProps<"div"> & { stagger?: number; delay?: number; as?: "div" | "ul" | "ol" };

/** Parent that staggers its <RevealItem> children when it scrolls into view. */
export const RevealGroup: React.FC<GroupProps> = ({ stagger = 0.07, delay = 0, as = "div", children, ...rest }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      variants={groupVariants(stagger, delay)}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </Tag>
  );
};

type ItemProps = HTMLMotionProps<"div"> & { as?: "div" | "li" | "article" };

export const RevealItem: React.FC<ItemProps> = ({ as = "div", children, ...rest }) => {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag variants={itemVariants} {...rest}>
      {children}
    </Tag>
  );
};

type WipeProps = {
  children: React.ReactNode;
  className?: string;
  /** Edge the image is uncovered from. */
  from?: "bottom" | "left" | "right" | "top";
  delay?: number;
};

const INSETS: Record<NonNullable<WipeProps["from"]>, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

/** Uncovers its content with a clip-path wipe while the content settles from a slight zoom. */
export const Wipe: React.FC<WipeProps> = ({ children, className, from = "bottom", delay = 0 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={reduce ? false : { clipPath: INSETS[from] }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={VIEWPORT}
      transition={{ duration: 1.2, ease: EASE_OUT, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={reduce ? false : { scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.6, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

type ParallaxProps = { children: React.ReactNode; className?: string; /** Total travel in px across the viewport. */ amount?: number };

/** Moves its content against the scroll direction as it crosses the viewport. */
export const Parallax: React.FC<ParallaxProps> = ({ children, className, amount = 60 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount / 2, amount / 2]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};

type SplitProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  /** Play on mount instead of when scrolled into view. */
  immediate?: boolean;
};

/** Headline whose words rise out of a mask, one after another. */
export const SplitText: React.FC<SplitProps> = ({ text, className, as = "h2", delay = 0, immediate = false }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.h2;
  const words = text.split(" ");
  const play = immediate ? { animate: "show" } : { whileInView: "show", viewport: VIEWPORT };
  return (
    <Tag
      className={className}
      aria-label={text}
      variants={groupVariants(0.055, delay)}
      initial={reduce ? "show" : "hidden"}
      {...play}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: "108%" },
              show: { y: "0%", transition: { duration: 1, ease: EASE_OUT } },
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

type MarqueeProps = { children: React.ReactNode; className?: string; /** Seconds for one full loop. */ duration?: number };

/** Endless horizontal strip. The content is rendered twice; the copy is hidden from assistive tech. */
export const Marquee: React.FC<MarqueeProps> = ({ children, className, duration = 38 }) => (
  <div className={cn("overflow-hidden", className)}>
    <div
      className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <div className="flex shrink-0 items-center">{children}</div>
      <div className="flex shrink-0 items-center" aria-hidden="true">
        {children}
      </div>
    </div>
  </div>
);
