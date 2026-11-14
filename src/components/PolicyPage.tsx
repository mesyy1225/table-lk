import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { policyConfig } from "@/lib/policyConfig";

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
  "text-muted-foreground leading-relaxed [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2";

const PolicyPage: React.FC<PolicyPageProps> = ({ title, intro, seoTitle, seoDescription, path, sections }) => {
  const { pathname } = useLocation();
  const c = policyConfig;

  return (
    <Layout>
      <SEOHead title={seoTitle} description={seoDescription} canonical={`${c.website}${path}`} />

      <div className="bg-primary/10 py-12">
        <div className="container mx-auto px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{title}</h1>
          <p className="text-sm text-muted-foreground">Last updated: {c.lastUpdated}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-16">
          {/* Table of contents */}
          <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
            <ol className="space-y-2 text-sm border-l border-border">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block pl-4 -ml-px border-l border-transparent text-muted-foreground hover:text-foreground hover:border-primary">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3">Other policies</p>
            <ul className="space-y-2 text-sm">
              {policyLinks
                .filter((l) => l.path !== pathname)
                .map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="text-primary hover:underline underline-offset-2">{l.name}</Link>
                  </li>
                ))}
            </ul>
          </aside>

          <article className="max-w-3xl">
            <div className={`${bodyStyles} text-base mb-10`}>{intro}</div>

            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 mb-10">
                <h2 className="text-xl md:text-2xl font-serif font-bold mb-4">
                  {i + 1}. {s.title}
                </h2>
                <div className={bodyStyles}>{s.body}</div>
              </section>
            ))}

            <div className="mt-12 rounded-lg border border-border bg-secondary/40 p-6">
              <h2 className="font-serif text-xl font-bold mb-4">Contact us</h2>
              <p className="text-muted-foreground mb-4">
                {c.legalName}
                {c.registrationNo && <> (Business Reg. No. {c.registrationNo})</>}
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span>{c.address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:underline">{c.phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                  <a href={`mailto:${c.email}`} className="hover:underline break-all">{c.email}</a>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default PolicyPage;
