import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

let lenis: Lenis | null = null;

/** Scroll the page to a position or element, smoothly when smooth scrolling is on. */
export const scrollToTarget = (target: number | string | HTMLElement, immediate = false) => {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset: typeof target === "number" ? 0 : -88 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
};

// Wheel events inside these stay native, so dialogs, menus and panels scroll on their own.
const NATIVE_SCROLL =
  '[data-lenis-prevent], [role="dialog"], [role="listbox"], [role="menu"], [data-radix-popper-content-wrapper], [data-radix-scroll-area-viewport], textarea, .bpWebchat';

/**
 * Smooth wheel scrolling for the whole site (Lenis) plus scroll restoration:
 * each new page starts at the top, and "#hash" links glide to their section.
 * Touch devices keep native scrolling. Off when the visitor prefers reduced motion.
 */
const SmoothScroll: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      // Let overlays (cart, dialogs, select menus, chat) scroll natively.
      prevent: (node: HTMLElement) =>
        document.body.hasAttribute("data-scroll-locked") ||
        document.documentElement.hasAttribute("data-nav-open") ||
        !!node.closest?.(NATIVE_SCROLL),
    });
    lenis = instance;

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis = null;
    };
  }, []);

  useEffect(() => {
    if (hash) {
      // Wait a frame so the target page has rendered its sections.
      const id = window.setTimeout(() => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) scrollToTarget(el);
      }, 80);
      return () => window.clearTimeout(id);
    }
    scrollToTarget(0, true);
  }, [pathname, hash]);

  return null;
};

export default SmoothScroll;
