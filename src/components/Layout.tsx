
import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow pb-16 pt-24 md:pt-28" // Added padding-top to prevent content from being hidden under the navbar
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
