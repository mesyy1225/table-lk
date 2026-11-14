import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Parallax, Reveal, RevealGroup, RevealItem, SplitText, Wipe } from "@/components/motion";
import { policyConfig } from "@/lib/policyConfig";
import { PHOTOS } from "@/lib/photos";
import { FRAME_FINISHES, TOP_FINISHES, type Finish } from "@/lib/finishes";
import { cn } from "@/lib/utils";

/** A small board-sample chip with its printed name. The wrapper carries the shadow so the punched hole stays open. */
const Sample: React.FC<{ finish: Finish }> = ({ finish }) => (
  <li className="flex w-[4.5rem] flex-col gap-2">
    <span className="block drop-shadow-[0_5px_8px_hsl(216_30%_12%/0.28)]">
      <span className={cn("chip block h-[5.25rem] w-full", finish.mat)} />
    </span>
    <span className="text-[0.8125rem] font-medium leading-tight">{finish.name}</span>
  </li>
);

const BUILD = [
  { term: "Top", value: "15 mm melamine board", note: "Cut to the size on your order." },
  { term: "Frame", value: "1.5″ × 1.5″ powder-coated steel", note: "Cut and welded in our own workshop." },
  { term: "Size", value: "Made to order", note: "Give us the length, width and height you need." },
];

const TIMES = [
  { where: "Colombo, Gampaha and Kalutara", days: policyConfig.colomboDeliveryDays },
  { where: "Other districts", days: policyConfig.outstationDeliveryDays },
  { where: "Custom sizes, time to build", days: policyConfig.customOrderDays },
];

const TEAM = [
  {
    name: "Jagath Sooriarachchi",
    role: "Founder and production supervisor",
    image: "https://u.cubeupload.com/Tablelkk/WhatsAppImage2025062.jpg",
    line: "Founded Table LK and oversees the production of every table in the workshop.",
  },
  {
    name: "Radika Madupani",
    role: "Senior manager",
    image: "https://u.cubeupload.com/Tablelkk/131WhatsAppImage2025062.jpg",
    line: "Runs the workshop day to day and keeps orders on schedule.",
  },
  {
    name: "Kalana Bimsara",
    role: "Sales manager",
    image: "https://u.cubeupload.com/Tablelkk/359WhatsAppImage2025062.jpg",
    line: "Helps customers choose the right table and follows each order through to delivery.",
  },
];

const arrowLink = "group inline-flex min-h-[2.75rem] items-center gap-2 font-semibold";

const About: React.FC = () => {
  return (
    <Layout>
      <SEOHead
        title="About TableLK - Table Manufacturer in Bandaragama, Sri Lanka"
        description="TableLK designs and builds office, study and dining tables in Bandaragama, Sri Lanka, with island-wide delivery. Meet the team behind every table."
        canonical={`${policyConfig.website}/about`}
      />

      {/* Opening statement and the workshop */}
      <section className="shell pt-10 md:pt-16">
        <SplitText
          as="h1"
          immediate
          text="We build tables in Bandaragama and sell them straight to you."
          className="display-xl max-w-[17ch]"
        />
        <Reveal delay={0.3} className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-12">
          <p className="max-w-[48ch] text-lg text-steel md:text-xl lg:col-span-6 lg:col-start-7">
            Table LK is a workshop, not a showroom. Office tables, computer tables and dining tables are made here to
            the size you ask for, and delivered anywhere in Sri Lanka.
          </p>
        </Reveal>

        <Wipe className="mt-10 aspect-[4/5] rounded-2xl sm:aspect-[16/9] md:mt-14 lg:aspect-[2/1]" delay={0.15}>
          <Parallax amount={80} className="h-[118%] w-full -translate-y-[9%]">
            <img
              src={PHOTOS.workshop}
              alt="An L-shaped office table with an ash-white top and black frame on the Table LK workshop floor in Bandaragama"
              className="h-full w-full object-cover object-[35%_40%]"
              decoding="async"
            />
          </Parallax>
        </Wipe>
      </section>

      {/* What a table is made of */}
      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SplitText text="What every table is made of." className="display-lg max-w-[12ch]" />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[44ch] text-steel md:text-lg">
                The same two materials go into every table we make. What changes from order to order is the size, the
                top finish and the frame colour.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="lg:col-span-7">
            <dl className="border-t border-ink/15">
              {BUILD.map((row) => (
                <div key={row.term} className="grid gap-x-8 gap-y-1.5 border-b border-ink/15 py-6 sm:grid-cols-[9rem_1fr] md:py-7">
                  <dt className="label text-steel sm:pt-2">{row.term}</dt>
                  <dd>
                    <p className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] md:text-[1.75rem]">
                      {row.value}
                    </p>
                    <p className="mt-1.5 text-steel">{row.note}</p>
                  </dd>
                </div>
              ))}
              <div className="grid gap-x-8 gap-y-4 border-b border-ink/15 py-6 sm:grid-cols-[9rem_1fr] md:py-7">
                <dt className="label text-steel sm:pt-2">Top finishes</dt>
                <dd>
                  <ul className="flex flex-wrap gap-x-4 gap-y-5">
                    {TOP_FINISHES.map((f) => (
                      <Sample key={f.id} finish={f} />
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="grid gap-x-8 gap-y-4 border-b border-ink/15 py-6 sm:grid-cols-[9rem_1fr] md:py-7">
                <dt className="label text-steel sm:pt-2">Frame colours</dt>
                <dd>
                  <ul className="flex flex-wrap gap-x-4 gap-y-5">
                    {FRAME_FINISHES.map((f) => (
                      <Sample key={f.id} finish={f} />
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Sold direct: how you pay and how long it takes */}
      <section className="mat-walnut section text-white">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SplitText text="No showroom between you and the people who build it." className="display-lg max-w-[15ch]" />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[48ch] text-white/75 md:text-lg">
                We sell direct from the workshop, so you pay the workshop price, and the size, top and frame colour
                are yours to choose. Pay by card, pay cash on delivery, or arrange the whole order on WhatsApp.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="lg:col-span-5 lg:col-start-8 lg:pt-3">
            <h3 className="label font-sans text-white/55">How long it takes</h3>
            <dl className="mt-4 border-t border-white/20">
              {TIMES.map((t) => (
                <div key={t.where} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/20 py-4">
                  <dt className="text-white/75">{t.where}</dt>
                  <dd className="num font-display text-xl font-semibold tracking-[-0.02em]">{t.days}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-white/60">Delivery to every district in Sri Lanka.</p>
            <Link to="/shipping-policy" className={cn(arrowLink, "mt-4")}>
              <span className="link-draw">Delivery details</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Real tables */}
      <section className="section">
        <div className="shell">
          <SplitText text="Tables from our workshop." className="display-lg" />

          <div className="mt-10 grid gap-x-6 gap-y-10 md:mt-14 md:grid-cols-12">
            <figure className="md:col-span-7">
              <Wipe className="aspect-[16/9] rounded-2xl">
                <img
                  src={PHOTOS.lShaped}
                  alt="An L-shaped workstation with a teak top on a white steel frame"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </Wipe>
              <figcaption className="mt-3 text-sm text-steel">L-shaped workstation, teak top on a white frame</figcaption>
            </figure>
            <figure className="md:col-span-5">
              <Wipe className="aspect-[4/3] rounded-2xl md:aspect-auto md:h-[calc(100%-2rem)]" delay={0.12}>
                <img
                  src={PHOTOS.dining}
                  alt="A dining table with a teak-finish top on a black steel frame"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </Wipe>
              <figcaption className="mt-3 text-sm text-steel">Dining table, teak finish on a black steel frame</figcaption>
            </figure>

            <Reveal className="md:col-span-5 md:self-center md:pr-6">
              <p className="max-w-[40ch] text-lg md:text-xl">
                Office tables, computer tables, L-shaped workstations, conference tables and dining tables, each one
                built to the size on the order.
              </p>
              <Link to="/shop" className={cn(arrowLink, "mt-4")}>
                <span className="link-draw">See the tables and prices</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
              </Link>
            </Reveal>
            <figure className="md:col-span-7">
              <Wipe className="aspect-[16/9] rounded-2xl" from="left">
                <img
                  src={PHOTOS.computer}
                  alt="A computer table with a black top on a white steel frame"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </Wipe>
              <figcaption className="mt-3 text-sm text-steel">Computer table, black top on a white steel frame</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* The people */}
      <section className="section border-t border-ink/10 bg-secondary/60">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SplitText text="The people behind every table." className="display-lg max-w-[12ch]" />
          </div>
          <RevealGroup as="ul" stagger={0.1} className="border-t border-ink/15 lg:col-span-7">
            {TEAM.map((member) => (
              <RevealItem as="li" key={member.name} className="flex items-start gap-5 border-b border-ink/15 py-6 md:gap-7 md:py-7">
                <img
                  src={member.image}
                  alt={`${member.name}, ${member.role} at TableLK`}
                  width={112}
                  height={112}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover md:h-28 md:w-28"
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl">{member.name}</h3>
                  <p className="mt-1 font-medium text-teak-deep">{member.role}</p>
                  <p className="mt-2 max-w-[46ch] text-steel">{member.line}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Next step */}
      <section className="shell pt-16 md:pt-24 lg:pt-28">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="display-lg max-w-[16ch]">Set the size yourself, or pick a table we already make.</h2>
            <p className="mt-5 max-w-[50ch] text-steel md:text-lg">
              The designer shows your table in 3D as you change the length, width, height, top and frame.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              to="/design"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 font-semibold text-white transition-[transform,background-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-teak-deep active:translate-y-0 active:scale-[0.98]"
            >
              Design your table
              <ArrowUpRight className="h-[1.125rem] w-[1.125rem] transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex h-14 items-center justify-center rounded-full border border-ink/25 px-7 font-semibold transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white active:scale-[0.98]"
            >
              Shop tables
            </Link>
          </div>
        </Reveal>
      </section>
    </Layout>
  );
};

export default About;
