import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
const Footer: React.FC = () => {
  return <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold">TableLK</h3>
            <p className="text-primary-foreground/80 max-w-xs">TableLK is a leading furniture manufacturer dedicated to crafting high-quality Hybrid office tables. With a commitment to exceptional craftsmanship and innovative design, we transform spaces into functional and aesthetic environments</p>
            <div className="flex space-x-4 pt-2">
              <a href="https://www.facebook.com/people/TableLK/100088083387315/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-foreground transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-accent-foreground transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-accent-foreground transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">TableLK Furniture, No. 31/A/02, Gammanpila, Bandaragama, Sri Lanka.</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="flex-shrink-0" />
                <span className="text-primary-foreground/80">‎+94 72 4613204</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="flex-shrink-0" />
                <span className="text-primary-foreground/80">bossfurniturelk@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/70 text-sm">
          <p>© {new Date().getFullYear()} TableLK. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;
