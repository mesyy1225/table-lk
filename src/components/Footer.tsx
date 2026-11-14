import React from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { policyLinks } from "@/components/PolicyPage";
import PaymentBadges from "@/components/PaymentBadges";
import { policyConfig } from "@/lib/policyConfig";
import { Facebook, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  const { get } = useSiteContent();
  // Admin-edited values (Site Content) override the defaults only when set.
  const phone = get("contact_phone", policyConfig.phone);
  const phoneHref = phone === policyConfig.phone ? policyConfig.phoneHref : `tel:${phone.replace(/[^\d+]/g, "")}`;
  const email = get("contact_email", policyConfig.email);
  const address = get("contact_address", policyConfig.address);

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold">TableLK</h3>
            <p className="text-primary-foreground/80 max-w-xs">
              TableLK is a Sri Lankan furniture manufacturer crafting durable, good-looking office, study and dining tables, made to order and delivered island-wide.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href={policyConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-foreground transition-colors"
                aria-label="TableLK on Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Customer Service</h4>
            <ul className="space-y-2">
              {policyLinks.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold">Get In Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">{address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="flex-shrink-0" />
                <a href={phoneHref} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors break-all">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/70 text-sm">
          <p>© {new Date().getFullYear()} TableLK. All rights reserved.</p>
          <PaymentBadges variant="dark" className="mt-4 justify-center" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
