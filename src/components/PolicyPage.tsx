import React, { ReactNode, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";

export interface PolicySection {
  id: string;
  title: string;
  body: ReactNode;
}

interface PolicyPageProps {
  title: string;
  intro: ReactNode;
  seoTitle: string;
  seoDescription: string;
  path: string;
  sections: PolicySection[];
}

export const policyLinks = [
  { name: "Terms & Conditions", path: "/terms-and-conditions" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Return & Refund Policy", path: "/return-policy" },
  { name: "Delivery Policy", path: "/shipping-policy" },
];

// Shared descendant styles so section bodies can be written as plain JSX.
const bodyStyles =
  "text-[1.0625rem] leading-[1.7] text-ink/80 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:mb-4 [&_ul:last-child]:mb-0 [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:space-y-2.5 [&_ol]:pl-5 [&_li]:pl-1 [&_li::marker]:text-steel [&_strong]:font-semibold [&_strong]:text-ink [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:decoration-teak-deep [&_a]:decoration-[1.5px] [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-300 hover:[&_a]:text-teak-deep";

const contactLink =
  "inline-flex min-h-[2.75rem] items-center gap-3 font-medium text-ink transition-colors duration-300 hover:text-teak-deep";

const PolicyPage: React.FC<PolicyPageProps> = ({ title, intro, seoTitle, seoDescription, path, sections }) => {
  const { pathname } = useLocation();
  const c = policyConfig;
  const mobileContents = useRef<HTMLDetailsElement>(null);

  const contents = (linkClass: string, onNavigate?: () => void) => (
    <ol>
      {sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} onClick={onNavigate} className={linkClass}>
            <span className="num w-6 shrink-0 text-steel">{i + 1}.</span>
            <span>{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <Layout>
      <SEOHead title={seoTitle} description={seoDescription} canonical={`${c.website}${path}`} />

      <header className="shell pb-8 pt-10 md:pb-12 md:pt-16">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-steel">
          <Link to="/" className="link-draw transition-colors duration-300 hover:text-ink">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-ink">
            {title}
          </span>
        </nav>
        <h1 className="display-lg max-w-[18ch]">{title}</h1>
        <p className="num mt-4 text-sm text-steel">Last updated: {c.lastUpdated}</p>
      </header>

      <div className="shell">
        <div className="grid grid-cols-1 gap-10 border-t border-ink/15 pt-8 md:pt-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          {/* Contents: sticky beside the text on desktop, a disclosure above it on phones */}
          <aside className="hidden lg:sticky lg:top-header lg:block lg:self-start">
            <nav aria-label="On this page">
              <h2 className="label mb-3 font-sans text-steel">On this page</h2>
              {contents(
                "flex gap-1.5 rounded-md py-1.5 text-[0.9375rem] leading-snug text-steel transition-colors duration-300 hover:text-ink",
              )}
            </nav>
          </aside>

          <article className="min-w-0 max-w-[68ch]">
            <details ref={mobileContents} className="group mb-8 rounded-xl border border-ink/15 bg-board lg:hidden">
              <summary className="flex min-h-[3rem] cursor-pointer list-none items-center justify-between gap-4 px-4 font-semibold [&::-webkit-details-marker]:hidden">
                On this page
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out-expo group-open:rotate-180" />
              </summary>
              <nav aria-label="On this page" className="border-t border-ink/10 px-4 py-2">
                {contents("flex min-h-[2.75rem] items-center gap-1.5 text-[0.9375rem] leading-snug text-ink/80", () => {
                  if (mobileContents.current) mobileContents.current.open = false;
                })}
              </nav>
            </details>

            <div className={`${bodyStyles} text-lg text-ink md:text-xl`}>{intro}</div>

            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-header pt-10 md:pt-12">
                <h2 className="mb-4 flex gap-2 text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] md:text-[1.625rem]">
                  <span className="num shrink-0 text-teak-deep">{i + 1}.</span>
                  <span>{s.title}</span>
                </h2>
                <div className={bodyStyles}>{s.body}</div>
              </section>
            ))}

            <section aria-labelledby="policy-contact" className="mt-14 rounded-2xl border border-ink/10 bg-board p-6 md:mt-16 md:p-8">
              <h2 id="policy-contact" className="text-[1.375rem] font-semibold leading-tight tracking-[-0.02em]">
                Contact us
              </h2>
              <p className="mt-2 text-steel">
                {c.legalName}
                {c.registrationNo && <> (Business Reg. No. {c.registrationNo})</>}
              </p>
              <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
                <li className="flex items-start gap-3 py-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-teak-deep" aria-hidden="true" />
                  <span>{c.address}</span>
                </li>
                <li>
                  <a href={c.phoneHref} className={`${contactLink} num`}>
                    <Phone className="h-4 w-4 shrink-0 text-teak-deep" aria-hidden="true" />
                    {c.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappLink("Hi TableLK, I have a question about your policies")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${contactLink} num`}
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-teak-deep" aria-hidden="true" />
                    WhatsApp {c.whatsapp}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${c.email}`} className={`${contactLink} break-all`}>
                    <Mail className="h-4 w-4 shrink-0 text-teak-deep" aria-hidden="true" />
                    {c.email}
                  </a>
                </li>
              </ul>
            </section>

            <nav aria-label="Other policies" className="mt-12 md:mt-14">
              <h2 className="label mb-1 font-sans text-steel">Other policies</h2>
              <ul className="divide-y divide-ink/10 border-b border-ink/10">
                {policyLinks
                  .filter((l) => l.path !== pathname)
                  .map((l) => (
                    <li key={l.path}>
                      <Link
                        to={l.path}
                        className="group flex min-h-[3rem] items-center justify-between gap-4 font-medium transition-colors duration-300 hover:text-teak-deep"
                      >
                        {l.name}
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default PolicyPage;
