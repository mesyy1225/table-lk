import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { EASE_OUT } from "./motion";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Page frame: fixed header, page content, footer.
 * The fixed-header offset lives here ("pt-header" = var(--header-h)) for every page except
 * the home page, whose hero photo intentionally sits behind the header. Pages must not add
 * their own top offset for the header; sticky panels use the "top-header" utility.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const isHome = pathname === "/";
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <motion.main
        id="main"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className={`flex-grow ${isHome ? "" : "pt-header pb-20 md:pb-28"}`}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
