import React, { useState } from "react";
import { Lock, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentBadgesProps {
  variant?: "light" | "dark";
  className?: string;
}

const Mark: React.FC<{ children: React.ReactNode; className?: string; label: string }> = ({ children, className, label }) => (
  <span
    role="img"
    aria-label={label}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-md border border-ink/15 bg-white px-2.5 text-[0.6875rem] font-bold leading-none",
      className
    )}
  >
    {children}
  </span>
);

const CardMarks: React.FC = () => (
  <>
    <Mark label="Visa" className="text-xs italic tracking-tight text-[#1a1f71]">VISA</Mark>
    <Mark label="Mastercard" className="px-1.5">
      <svg viewBox="0 0 32 20" className="h-4 w-auto" aria-hidden="true">
        <circle cx="12" cy="10" r="8" fill="#eb001b" />
        <circle cx="20" cy="10" r="8" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    </Mark>
    <Mark label="American Express" className="border-[#2e77bc] bg-[#2e77bc] text-white">AMEX</Mark>
  </>
);

/** "Secure payment by PayHere" plus accepted payment marks. */
const PaymentBadges: React.FC<PaymentBadgesProps> = ({ variant = "light", className }) => {
  const [bannerFailed, setBannerFailed] = useState(false);
  const dark = variant === "dark";

  return (
    <div className={cn("space-y-2.5", className)}>
      <p className={cn("flex items-center gap-1.5 text-[0.8125rem] font-medium", dark ? "text-white/70" : "text-steel")}>
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Secure payment by PayHere
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {!bannerFailed ? (
          <span className={cn("inline-flex h-9 max-w-full items-center rounded-md bg-white px-2", !dark && "border border-ink/15")}>
            <img
              src="https://www.payhere.lk/downloads/images/payhere_long_banner.png"
              alt="PayHere secure payments: Visa, Mastercard, American Express"
              loading="lazy"
              decoding="async"
              className="h-auto max-h-7 w-auto max-w-full object-contain"
              onError={() => setBannerFailed(true)}
            />
          </span>
        ) : (
          <CardMarks />
        )}
        <Mark
          label="Cash on delivery"
          className={cn("gap-1.5 text-xs font-semibold", dark ? "border-white/25 bg-white/10 text-white" : "text-ink")}
        >
          <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
          Cash on delivery
        </Mark>
      </div>
    </div>
  );
};

export default PaymentBadges;

// ---- Order payment status / method badges (orders pages) ----

/** Status colours are tints of the status hue with dark text, so each stays readable on ash and on white. */
const TONES = {
  good: "border-emerald-700/25 bg-emerald-50 text-emerald-900",
  wait: "border-amber-700/30 bg-amber-50 text-amber-900",
  bad: "border-red-700/25 bg-red-50 text-red-800",
  info: "border-sky-700/25 bg-sky-50 text-sky-900",
  quiet: "border-ink/15 bg-ink/[0.04] text-steel",
  plain: "border-ink/20 bg-white text-ink",
} as const;

const STATUS_STYLES: Record<string, string> = {
  paid: TONES.good,
  pending: TONES.wait,
  unpaid: TONES.quiet,
  failed: TONES.bad,
  cancelled: TONES.quiet,
  refunded: TONES.info,
  chargedback: TONES.bad,
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Payment pending",
  unpaid: "Unpaid",
  failed: "Payment failed",
  cancelled: "Payment cancelled",
  refunded: "Refunded",
  chargedback: "Charged back",
};

const METHOD_LABELS: Record<string, string> = {
  card: "Card",
  cod: "Cash on delivery",
  whatsapp: "WhatsApp",
};

const ORDER_STYLES: Record<string, string> = {
  pending: TONES.wait,
  confirmed: TONES.info,
  processing: TONES.info,
  shipped: TONES.info,
  delivered: TONES.good,
  completed: TONES.good,
  cancelled: TONES.quiet,
  refunded: TONES.quiet,
};

const pill = "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold leading-none";
const dot = <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />;

export const PaymentStatusBadge: React.FC<{ status?: string | null; className?: string }> = ({ status, className }) =>
  status ? (
    <span className={cn(pill, STATUS_STYLES[status] || STATUS_STYLES.unpaid, className)}>
      {dot}
      {STATUS_LABELS[status] || status}
    </span>
  ) : null;

export const PaymentMethodBadge: React.FC<{ method?: string | null; className?: string }> = ({ method, className }) =>
  method ? (
    <span className={cn(pill, TONES.plain, className)}>
      {METHOD_LABELS[method] || method}
    </span>
  ) : null;

/** Order progress (pending, confirmed, shipped, delivered...). Unknown values are shown as written. */
export const OrderStatusBadge: React.FC<{ status?: string | null; className?: string }> = ({ status, className }) =>
  status ? (
    <span className={cn(pill, "capitalize", ORDER_STYLES[status] || TONES.quiet, className)}>
      {dot}
      {status}
    </span>
  ) : null;
