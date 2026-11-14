import { routeSeo } from "@/lib/seo";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, MessageCircle, Minus, Plus, Ruler } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { EASE_OUT } from "@/components/motion";
import { supabase } from "@/integrations/supabase/client";
import { FRAME_FINISHES, TOP_FINISHES, findFinish, type Finish } from "@/lib/finishes";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";
import { cn } from "@/lib/utils";
import type { LegStyle, TableSpec } from "@/components/TableScene";

// three.js is large, so the 3D model loads as its own chunk.
const TableScene = lazy(() => import("@/components/TableScene"));

const LIMITS = {
  length: { min: 24, max: 96 },
  width: { min: 18, max: 48 },
  height: { min: 24, max: 42 },
} as const;
type Dim = keyof typeof LIMITS;

const PRESETS = [
  { label: "4 × 2 ft", length: 48, width: 24, height: 30 },
  { label: "5 × 2 ft", length: 60, width: 24, height: 30 },
  { label: "6 × 3 ft", length: 72, width: 36, height: 30 },
  { label: "8 × 4 ft", length: 96, width: 48, height: 30 },
];

const LEG_STYLES: { id: LegStyle; name: string; note: string }[] = [
  { id: "loop", name: "Loop legs", note: "Each end is a closed steel loop with a bar along the floor." },
  { id: "four", name: "Four legs", note: "Four straight legs, open at the floor." },
];

const MAX_QTY = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clamp = (value: number, dim: Dim) => Math.min(LIMITS[dim].max, Math.max(LIMITS[dim].min, Math.round(value)));
const feet = (inches: number) => {
  const ft = Math.floor(inches / 12);
  const rest = inches % 12;
  return rest ? `${ft} ft ${rest} in` : `${ft} ft`;
};
const cm = (inches: number) => `${Math.round(inches * 2.54)} cm`;

const Chip: React.FC<{ finish: Finish; selected: boolean; onSelect: () => void; group: string }> = ({ finish, selected, onSelect, group }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    aria-label={`${group}: ${finish.name}`}
    onClick={onSelect}
    className={cn(
      "flex w-[4.75rem] flex-col gap-2 text-left transition-transform duration-500 ease-out-expo",
      selected ? "-translate-y-1.5" : "hover:-translate-y-0.5",
    )}
  >
    <span className="relative block">
      <span className={cn("chip block h-[5.5rem] w-full border border-ink/10 shadow-chip", finish.mat)} />
      <span
        className={cn(
          "absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-teak text-ink transition-[transform,opacity] duration-300 ease-out-expo",
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    </span>
    <span className={cn("text-[0.8125rem] leading-tight transition-colors duration-300", selected ? "font-semibold text-ink" : "text-steel")}>
      {finish.name}
    </span>
  </button>
);

const SizeControl: React.FC<{ dim: Dim; label: string; value: number; onChange: (v: number) => void }> = ({ dim, label, value, onChange }) => {
  const { min, max } = LIMITS[dim];
  const id = `size-${dim}`;
  const stepper =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-35";
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <label id={id} className="font-semibold">
          {label}
        </label>
        <p className="num text-right text-sm text-steel">
          <span className="text-base font-semibold text-ink">{value} in</span> · {feet(value)} · {cm(value)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={stepper} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Reduce ${label.toLowerCase()} by 1 inch`}>
          <Minus className="h-4 w-4" />
        </button>
        <Slider
          aria-labelledby={id}
          min={min}
          max={max}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-ink [&_[role=slider]]:bg-white"
        />
        <button type="button" className={stepper} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()} by 1 inch`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const Step: React.FC<{ title: string; children: React.ReactNode; hint?: string }> = ({ title, hint, children }) => (
  <section className="border-t border-ink/15 py-7">
    <h2 className="text-lg">{title}</h2>
    {hint && <p className="mt-1 text-sm text-steel">{hint}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const DesignTable: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const num = (key: string, dim: Dim, fallback: number) => {
    const raw = Number(params.get(key));
    return Number.isFinite(raw) && raw > 0 ? clamp(raw, dim) : fallback;
  };

  const [top, setTop] = useState(() => findFinish(TOP_FINISHES, params.get("top")));
  const [frame, setFrame] = useState(() => findFinish(FRAME_FINISHES, params.get("frame")));
  const [legs, setLegs] = useState<LegStyle>(() => (params.get("legs") === "four" ? "four" : "loop"));
  const [length, setLength] = useState(() => num("l", "length", 60));
  const [width, setWidth] = useState(() => num("w", "width", 24));
  const [height, setHeight] = useState(() => num("h", "height", 30));
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [showSizes, setShowSizes] = useState(true);
  const [dragged, setDragged] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const query = useMemo(
    () => new URLSearchParams({ top: top.id, frame: frame.id, legs, l: String(length), w: String(width), h: String(height) }).toString(),
    [top, frame, legs, length, width, height],
  );

  // Keep the address in step with the design, so the link can be shared or sent with the order.
  useEffect(() => {
    const id = window.setTimeout(() => setParams(query, { replace: true, preventScrollReset: true }), 250);
    return () => window.clearTimeout(id);
  }, [query, setParams]);

  const spec: TableSpec = useMemo(
    () => ({ length, width, height, topHex: top.hex, topGrain: top.grain, frameHex: frame.hex, legs }),
    [length, width, height, top, frame, legs],
  );

  const legName = LEG_STYLES.find((l) => l.id === legs)!.name.toLowerCase();
  const sizeLine = `${length} × ${width} × ${height} in`;
  const summary = [
    `Size: ${sizeLine} (length × width × height)`,
    `Top: ${top.name}`,
    `Frame: ${frame.name}, ${legName}`,
    `Quantity: ${quantity}`,
    ...(note.trim() ? [`Note: ${note.trim()}`] : []),
    `Design: ${policyConfig.website}/design?${query}`,
  ];
  const whatsappText = `Hi Table LK, I'd like a price for this custom table:\n${summary.map((l) => `- ${l}`).join("\n")}`;
  const activePreset = PRESETS.find((p) => p.length === length && p.width === width && p.height === height);

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!contact.name.trim()) next.name = "Enter your name.";
    if (!EMAIL_RE.test(contact.email.trim())) next.email = "Enter a valid email address.";
    if (contact.phone.trim().length > 50) next.phone = "That phone number is too long.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    const { error } = await (supabase as any).from("contact_messages").insert({
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim() || null,
      subject: `Custom table request: ${sizeLine}`.slice(0, 200),
      message: summary.join("\n").slice(0, 5000),
    });
    setSending(false);
    if (error) {
      toast.error("Your request couldn't be sent.", { description: "Please try again, or send it on WhatsApp instead." });
      return;
    }
    setSent(true);
  };

  return (
    <Layout>
      <SEOHead {...routeSeo("/design")} />

      <div className="lg:shell lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(23rem,0.7fr)] lg:items-start lg:gap-12 lg:pt-8 xl:gap-16">
        {/* The model. On phones it stays pinned to the top of the screen while the controls scroll under it. */}
        <div className="sticky top-0 z-20 -mt-[var(--header-h)] border-b border-ink/10 bg-ash pt-[var(--header-h)] lg:top-[calc(var(--header-h)+1.5rem)] lg:z-0 lg:mt-0 lg:border-0 lg:bg-transparent lg:pt-0">
          <div className="relative h-[38svh] min-h-[15rem] overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#ffffff_0%,hsl(var(--ash))_72%)] lg:h-[calc(100svh-var(--header-h)-4.5rem)] lg:min-h-[30rem] lg:rounded-2xl lg:border lg:border-ink/10">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-steel" role="status">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading the 3D model
                </div>
              }
            >
              <TableScene spec={spec} dimensions={showSizes} autoRotate onInteract={() => setDragged(true)} />
            </Suspense>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 lg:p-5">
              <p className="num rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-white">{sizeLine}</p>
              <button
                type="button"
                onClick={() => setShowSizes((s) => !s)}
                aria-pressed={showSizes}
                className="pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full border border-ink/20 bg-white px-4 text-sm font-semibold transition-colors duration-200 hover:border-ink"
              >
                <Ruler className="h-4 w-4" />
                {showSizes ? "Hide sizes" : "Show sizes"}
              </button>
            </div>
            <AnimatePresence>
              {!dragged && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.6 } }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3.5 py-1.5 text-sm text-steel lg:top-5"
                >
                  Drag to turn the table
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-5 pt-8 md:px-8 lg:px-0 lg:pt-2">
          <h1 className="display-lg">Design your table</h1>
          <p className="mt-4 max-w-[46ch] text-steel md:text-lg">
            Choose the finish and set the size. We build it in our Bandaragama workshop and reply with the price and
            delivery time.
          </p>

          <div className="mt-8">
            <Step title="Top finish">
              <div role="radiogroup" aria-label="Top finish" className="flex flex-wrap gap-x-4 gap-y-5 pt-1.5">
                {TOP_FINISHES.map((f) => (
                  <Chip key={f.id} finish={f} group="Top" selected={f.id === top.id} onSelect={() => setTop(f)} />
                ))}
              </div>
            </Step>

            <Step title="Frame">
              <div role="radiogroup" aria-label="Frame colour" className="flex flex-wrap gap-x-4 gap-y-5 pt-1.5">
                {FRAME_FINISHES.map((f) => (
                  <Chip key={f.id} finish={f} group="Frame" selected={f.id === frame.id} onSelect={() => setFrame(f)} />
                ))}
              </div>
              <div role="radiogroup" aria-label="Leg style" className="mt-6 grid gap-3 sm:grid-cols-2">
                {LEG_STYLES.map((style) => {
                  const selected = style.id === legs;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setLegs(style.id)}
                      className={cn(
                        "rounded-xl border bg-white p-4 text-left transition-[border-color,box-shadow] duration-200",
                        selected ? "border-ink shadow-[inset_0_0_0_1px_hsl(var(--ink))]" : "border-ink/15 hover:border-ink/50",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3 font-semibold">
                        {style.name}
                        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full bg-teak text-ink transition-[transform,opacity] duration-300 ease-out-expo", selected ? "scale-100 opacity-100" : "scale-50 opacity-0")}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-steel">{style.note}</span>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step title="Size" hint="Start from a common size, then adjust to the inch.">
              <div className="mb-7 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setLength(p.length);
                      setWidth(p.width);
                      setHeight(p.height);
                    }}
                    aria-pressed={activePreset?.label === p.label}
                    className={cn(
                      "num h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-200",
                      activePreset?.label === p.label ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="space-y-7">
                <SizeControl dim="length" label="Length" value={length} onChange={(v) => setLength(clamp(v, "length"))} />
                <SizeControl dim="width" label="Width" value={width} onChange={(v) => setWidth(clamp(v, "width"))} />
                <SizeControl dim="height" label="Height" value={height} onChange={(v) => setHeight(clamp(v, "height"))} />
              </div>
              <p className="mt-6 text-sm text-steel">
                Need a larger table, an L-shape, or cable holes? Add it to the note below and we'll confirm what we
                can build.
              </p>
            </Step>

            <Step title="Quantity and notes">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-ink/20 bg-white">
                  <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-ink/[0.06] disabled:opacity-35" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Reduce quantity">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="num w-10 text-center text-lg font-semibold" aria-live="polite" aria-label={`Quantity ${quantity}`}>
                    {quantity}
                  </span>
                  <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-ink/[0.06] disabled:opacity-35" onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))} disabled={quantity >= MAX_QTY} aria-label="Increase quantity">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-steel">{quantity > 1 ? "tables of this design" : "table"}</p>
              </div>
              <div className="mt-6">
                <Label htmlFor="design-note">Anything else we should know (optional)</Label>
                <Textarea
                  id="design-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={600}
                  placeholder="For example: cable holes, a drawer, the delivery town."
                  className="mt-2 min-h-[96px]"
                />
              </div>
            </Step>

            <section className="border-t border-ink/15 py-7" aria-label="Your design">
              <h2 className="text-lg">Your design</h2>
              <dl className="num mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[0.9375rem]">
                <dt className="text-steel">Size</dt>
                <dd className="font-semibold">
                  {sizeLine} <span className="font-normal text-steel">({feet(length)} × {feet(width)})</span>
                </dd>
                <dt className="text-steel">Top</dt>
                <dd className="font-semibold">{top.name}</dd>
                <dt className="text-steel">Frame</dt>
                <dd className="font-semibold">
                  {frame.name}, {legName}
                </dd>
                <dt className="text-steel">Quantity</dt>
                <dd className="font-semibold">{quantity}</dd>
              </dl>

              <div className="mt-7 space-y-3">
                <Button asChild size="lg" variant="teak" className="h-14 w-full text-base">
                  <a href={whatsappLink(whatsappText)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="!size-5" />
                    Send this design on WhatsApp
                  </a>
                </Button>
                <button
                  type="button"
                  onClick={() => setFormOpen((o) => !o)}
                  aria-expanded={formOpen}
                  aria-controls="design-request"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-ink/25 font-semibold transition-colors duration-200 hover:border-ink"
                >
                  Send the request by email instead
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 ease-out-expo", formOpen && "rotate-180")} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {formOpen && (
                  <motion.div
                    id="design-request"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    {sent ? (
                      <div className="mt-5 rounded-xl border border-ink/15 bg-white p-5" role="status">
                        <p className="flex items-center gap-2 font-semibold">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teak">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          Request sent
                        </p>
                        <p className="mt-2 text-sm text-steel">
                          We have your design and will reply to {contact.email.trim()} with the price and delivery time.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={sendRequest} noValidate className="mt-5 space-y-4">
                        {(
                          [
                            { key: "name", label: "Your name", type: "text", auto: "name" },
                            { key: "email", label: "Email", type: "email", auto: "email" },
                            { key: "phone", label: "Phone (optional)", type: "tel", auto: "tel" },
                          ] as const
                        ).map((f) => (
                          <div key={f.key}>
                            <Label htmlFor={`design-${f.key}`}>{f.label}</Label>
                            <Input
                              id={`design-${f.key}`}
                              type={f.type}
                              autoComplete={f.auto}
                              value={contact[f.key]}
                              onChange={(e) => {
                                setContact((c) => ({ ...c, [f.key]: e.target.value }));
                                if (errors[f.key]) setErrors((er) => ({ ...er, [f.key]: "" }));
                              }}
                              aria-invalid={!!errors[f.key]}
                              aria-describedby={errors[f.key] ? `design-${f.key}-error` : undefined}
                              className="mt-2"
                            />
                            {errors[f.key] && (
                              <p id={`design-${f.key}-error`} className="mt-1.5 text-sm font-medium text-destructive">
                                {errors[f.key]}
                              </p>
                            )}
                          </div>
                        ))}
                        <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={sending}>
                          {sending ? (
                            <>
                              <Loader2 className="animate-spin" /> Sending
                            </>
                          ) : (
                            "Send request"
                          )}
                        </Button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-5 text-sm text-steel">
                Sending a design is a price request, not an order: we confirm the price with you first. Custom tables
                take {policyConfig.customOrderDays} to build.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DesignTable;
