
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import CartPopup from "./CartPopup";
import { toast } from "sonner";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { state: cartState } = useCart();
  const { state: authState, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleCart = () => {
    if (!authState.isAuthenticated) {
      toast.error("Please sign in to access your cart", {
        description: "You need to be logged in to view your shopping cart",
        action: {
          label: "Sign In",
          onClick: () => navigate("/login")
        }
      });
      return;
    }
    setIsCartOpen(!isCartOpen);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-6 md:px-8 lg:px-12",
        isScrolled
          ? "py-3 bg-white/90 backdrop-blur-sm shadow-sm"
          : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo - Fixed alignment */}
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/188afeac-f211-4f16-bbfa-8018bbc74324.png" 
            alt="TableLK Logo" 
            className="h-10 md:h-12 w-auto object-contain"
          />
          <span className="sr-only">TableLK</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "nav-item",
                isActive(item.path) && "nav-item-active text-primary font-semibold"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Right Side: Cart & Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            className="relative" 
            onClick={toggleCart}
            aria-label="Shopping Cart"
          >
            <Button variant="ghost" className="p-2" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {authState.isAuthenticated && cartState.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartState.totalItems}
                </span>
              )}
            </Button>
          </button>

          {authState.isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{authState.user?.name}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-2">
          <button 
            className="relative mr-2"
            onClick={toggleCart}
            aria-label="Shopping Cart"
          >
            <Button variant="ghost" className="p-1 h-9 w-9" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {authState.isAuthenticated && cartState.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartState.totalItems}
                </span>
              )}
            </Button>
          </button>
          <Button
            variant="ghost"
            className="p-1 h-9 w-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t mt-3"
          >
            <div className="max-w-7xl mx-auto py-4 flex flex-col">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "block py-3 px-4 text-lg",
                      isActive(item.path) && "font-semibold text-primary"
                    )}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="border-t border-gray-100 mt-3 pt-3 px-4">
                {authState.isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 py-2">
                      <User className="h-4 w-4" />
                      <span>{authState.user?.name}</span>
                    </div>
                    <Button onClick={logout}>Logout</Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" asChild>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register">Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Popup */}
      <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Navbar;
