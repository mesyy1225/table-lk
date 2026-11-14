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
      "inline-flex h-6 items-center justify-center rounded border bg-white px-1.5 text-[10px] font-bold leading-none",
      className
    )}
  >
    {children}
  </span>
);

const CardMarks: React.FC = () => (
  <>
    <Mark label="Visa" className="border-gray-200 italic tracking-tight text-[#1a1f71] text-xs">VISA</Mark>
    <Mark label="Mastercard" className="border-gray-200 px-1">
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
    <div className={cn("space-y-2", className)}>
      <p className={cn("flex items-center gap-1.5 text-xs font-medium", dark ? "text-white/80" : "text-muted-foreground")}>
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Secure payment by PayHere
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {!bannerFailed ? (
          <span className={cn("inline-flex max-w-full rounded", dark && "bg-white p-1")}>
            <img
              src="https://www.payhere.lk/downloads/images/payhere_long_banner.png"
              alt="PayHere secure payments: Visa, Mastercard, American Express"
              loading="lazy"
              className="h-auto max-h-9 w-auto max-w-full object-contain"
              onError={() => setBannerFailed(true)}
            />
          </span>
        ) : (
          <CardMarks />
        )}
        <Mark
          label="Cash on delivery"
          className={cn("gap-1 font-semibold", dark ? "border-white/30 bg-white/10 text-white" : "border-green-200 bg-green-50 text-green-700")}
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

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  unpaid: "bg-gray-100 text-gray-700 border-gray-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  refunded: "bg-blue-100 text-blue-800 border-blue-200",
  chargedback: "bg-red-100 text-red-800 border-red-200",
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

const pill = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export const PaymentStatusBadge: React.FC<{ status?: string | null; className?: string }> = ({ status, className }) =>
  status ? (
    <span className={cn(pill, STATUS_STYLES[status] || STATUS_STYLES.unpaid, className)}>
      {STATUS_LABELS[status] || status}
    </span>
  ) : null;

export const PaymentMethodBadge: React.FC<{ method?: string | null; className?: string }> = ({ method, className }) =>
  method ? (
    <span className={cn(pill, "bg-background text-foreground border-border", className)}>
      {METHOD_LABELS[method] || method}
    </span>
  ) : null;
