import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";
import CartPopup from "./CartPopup";
import Logo from "./Logo";
import { EASE_OUT } from "./motion";

const NAV_ITEMS = [
  { name: "Shop", path: "/shop" },
  { name: "Design a table", path: "/design" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

/**
 * Fixed site header. Its height is the CSS variable --header-h (set in index.css), the same
 * value Layout uses to offset page content, so the header can never cover a page's first line.
 * On the home page it starts clear over the hero photo; everywhere else it is solid.
 * It slides away while scrolling down and returns on the first scroll up.
 */
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { state: cartState } = useCart();
  const { state: authState, logout } = useAuth();
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (y > 480 && y > previous + 4) setHidden(true);
    else if (y < previous - 4 || y <= 480) setHidden(false);
  });

  useEffect(() => {
    setMenuOpen(false);
    setCartOpen(false);
  }, [pathname]);

  // Lock the page behind the full-screen mobile menu.
  useEffect(() => {
    const root = document.documentElement;
    if (menuOpen) {
      root.setAttribute("data-nav-open", "");
      root.style.overflow = "hidden";
    } else {
      root.removeAttribute("data-nav-open");
      root.style.overflow = "";
    }
    return () => {
      root.removeAttribute("data-nav-open");
      root.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const overHero = pathname === "/" && !scrolled && !menuOpen;
  const count = cartState.totalItems;

  const iconButton = cn(
    "relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300",
    overHero ? "text-white hover:bg-white/15" : "text-ink hover:bg-ink/[0.07]",
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 h-[var(--header-h)] transition-[transform,background-color,border-color,box-shadow] duration-500 ease-out-expo",
          hidden && !menuOpen && !cartOpen ? "-translate-y-full" : "translate-y-0",
          overHero
            ? "border-b border-transparent bg-transparent"
            : "border-b border-ink/10 bg-ash/90 backdrop-blur-md",
        )}
      >
        <div className="shell flex h-full items-center justify-between gap-6">
          <Link to="/" aria-label="Table LK home" className="shrink-0 rounded-md">
            <Logo tone={overHero ? "light" : "ink"} />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "link-draw text-[0.9375rem] font-medium transition-colors duration-300",
                  overHero ? "text-white" : "text-ink",
                )}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <div className={cn("mr-2 hidden items-center gap-5 text-[0.9375rem] font-medium lg:flex", overHero ? "text-white" : "text-ink")}>
              {authState.isAuthenticated ? (
                <>
                  <Link to="/my-orders" className="link-draw">
                    My orders
                  </Link>
                  <button type="button" onClick={logout} className="link-draw">
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" className="link-draw">
                  Log in
                </Link>
              )}
            </div>

            <button
              type="button"
              className={iconButton}
              onClick={() => setCartOpen((open) => !open)}
              aria-label={count > 0 ? `Cart, ${count} item${count > 1 ? "s" : ""}` : "Cart"}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 22 }}
                    className="num absolute right-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-teak px-1 text-[0.6875rem] font-bold leading-none text-ink"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              className={cn(iconButton, "lg:hidden")}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        <CartPopup isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            data-lenis-prevent
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-ash pt-[var(--header-h)] lg:hidden"
          >
            <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-between gap-10 pb-10 pt-8">
              <ul className="flex flex-col">
                {[{ name: "Home", path: "/" }, ...NAV_ITEMS].map((item, i) => (
                  <li key={item.path} className="overflow-hidden border-b border-ink/10">
                    <motion.div
                      initial={reduce ? false : { y: "110%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.08 + i * 0.05 }}
                    >
                      <NavLink
                        to={item.path}
                        end
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-between py-4 font-display text-[2rem] font-bold leading-none tracking-[-0.02em]",
                            isActive ? "text-teak-deep" : "text-ink",
                          )
                        }
                      >
                        {item.name}
                        <ArrowUpRight className="h-6 w-6 opacity-40" />
                      </NavLink>
                    </motion.div>
                  </li>
                ))}
              </ul>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.35 }}
                className="space-y-5"
              >
                <div className="flex gap-3">
                  {authState.isAuthenticated ? (
                    <>
                      <Link to="/my-orders" className="flex h-12 flex-1 items-center justify-center rounded-full border border-ink/25 font-medium">
                        My orders
                      </Link>
                      <button type="button" onClick={logout} className="flex h-12 flex-1 items-center justify-center rounded-full bg-ink font-medium text-white">
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex h-12 flex-1 items-center justify-center rounded-full border border-ink/25 font-medium">
                        Log in
                      </Link>
                      <Link to="/register" className="flex h-12 flex-1 items-center justify-center rounded-full bg-ink font-medium text-white">
                        Create account
                      </Link>
                    </>
                  )}
                </div>
                <p className="text-sm text-steel">
                  Call{" "}
                  <a href={policyConfig.phoneHref} className="font-semibold text-ink underline underline-offset-4">
                    {policyConfig.phone}
                  </a>{" "}
                  or{" "}
                  <a
                    href={whatsappLink("Hi Table LK, I'd like to order a table")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline underline-offset-4"
                  >
                    message us on WhatsApp
                  </a>
                  .
                </p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
