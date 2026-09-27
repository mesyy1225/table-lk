
import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppBubble from "./WhatsAppBubble";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex-grow pb-16 ${pathname === "/" ? "" : "pt-20 md:pt-[88px]"}`}
      >
        {children}
      </motion.main>
      <Footer />
      <WhatsAppBubble />
    </div>
  );
};

export default Layout;
