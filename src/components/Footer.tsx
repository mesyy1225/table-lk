import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Facebook } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { policyLinks } from "@/components/PolicyPage";
import PaymentBadges from "@/components/PaymentBadges";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";
import { Reveal } from "@/components/motion";

const SITE_LINKS = [
  { to: "/shop", label: "Shop tables" },
  { to: "/design", label: "Design a table" },
  { to: "/about", label: "About the workshop" },
  { to: "/contact", label: "Contact" },
  { to: "/my-orders", label: "My orders" },
];

const linkClass = "link-draw text-white/75 transition-colors duration-300 hover:text-white";

const Footer: React.FC = () => {
  const { get } = useSiteContent();
  // Admin-edited values (Site Content) override the defaults only when set.
  const phone = get("contact_phone", policyConfig.phone);
  const phoneHref = phone === policyConfig.phone ? policyConfig.phoneHref : `tel:${phone.replace(/[^\d+]/g, "")}`;
  const email = get("contact_email", policyConfig.email);
  const address = get("contact_address", policyConfig.address);

  return (
    <footer className="mat-ink overflow-hidden text-white">
      <div className="shell pb-8 pt-16 md:pt-24">
        <Reveal className="flex flex-col gap-8 border-b border-white/15 pb-12 md:flex-row md:items-end md:justify-between md:pb-16">
          <h2 className="display-lg max-w-[16ch] text-white">Need a size we don't list? We'll build it.</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/design"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teak px-6 font-semibold text-ink transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0"
            >
              Design your table
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href={whatsappLink("Hi Table LK, I'd like a table made to my size")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-6 font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-ink"
            >
              Ask on WhatsApp
            </a>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-12 md:grid-cols-12 md:py-16">
          <div className="col-span-2 md:col-span-4">
            <p className="max-w-[34ch] text-white/75">
              Table LK builds office, study and dining tables in its own workshop in Bandaragama, to your size and
              finish, and delivers them anywhere in Sri Lanka.
            </p>
            <a
              href={policyConfig.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-white/75 transition-colors duration-300 hover:text-white"
            >
              <Facebook className="h-5 w-5" />
              <span className="link-draw">Table LK on Facebook</span>
            </a>
          </div>

          <nav aria-label="Site" className="md:col-span-2 md:col-start-6">
            <h3 className="label mb-4 text-white/50">Site</h3>
            <ul className="space-y-2.5">
              {SITE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Policies" className="md:col-span-2">
            <h3 className="label mb-4 text-white/50">Policies</h3>
            <ul className="space-y-2.5">
              {policyLinks.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className={linkClass}>
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-3">
            <h3 className="label mb-4 text-white/50">Workshop</h3>
            <address className="space-y-2.5 not-italic text-white/75">
              <p className="max-w-[26ch]">{address}</p>
              <p>
                <a href={phoneHref} className={`${linkClass} num`}>
                  {phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${email}`} className={`${linkClass} break-all`}>
                  {email}
                </a>
              </p>
              <p className="text-white/50">{policyConfig.businessHours}</p>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/15 pt-8 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {policyConfig.legalName}. All rights reserved.
          </p>
          <PaymentBadges variant="dark" />
        </div>
      </div>

      {/* Oversized wordmark, cropped by the bottom edge of the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none -mb-[0.2em] select-none whitespace-nowrap text-center font-display font-bold leading-[0.8] tracking-[-0.05em] text-white/[0.06]"
        style={{ fontSize: "clamp(4.5rem, 22vw, 22rem)" }}
      >
        Table LK
      </div>
    </footer>
  );
};

export default Footer;
