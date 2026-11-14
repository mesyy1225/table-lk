import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, Clock, Loader2, MessageCircle, Phone, X } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { PaymentMethodBadge, PaymentStatusBadge } from "@/components/PaymentBadges";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/components/motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";
import { cn } from "@/lib/utils";

type CardState = "checking" | "paid" | "failed" | "unconfirmed";

interface OrderStatusRow {
  order_ref: string;
  status: string;
  payment_status: string;
  total: number;
  payment_method: string;
}

const POLL_INTERVAL_MS = 3000;
const POLL_ATTEMPTS = 10; // ~30 seconds

const fetchStatus = async (ref: string): Promise<OrderStatusRow | null> => {
  const { data, error } = await (supabase as any).rpc("get_order_status", { _order_ref: ref });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
};

type Mark = "success" | "whatsapp" | "checking" | "pending" | "failed" | "cancelled";

const MARK_TONE: Record<Mark, string> = {
  success: "bg-teak text-ink",
  whatsapp: "bg-teak-tint text-teak-deep",
  checking: "border border-ink/15 text-ink",
  pending: "bg-teak-tint text-teak-deep",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-ink/[0.07] text-ink",
};

const MARK_ICON = { whatsapp: MessageCircle, checking: Loader2, pending: Clock, failed: AlertTriangle, cancelled: X };

/** The status mark above the heading. Only a success animates: the disc settles and the check draws in. */
const StatusMark: React.FC<{ kind: Mark }> = ({ kind }) => {
  const reduce = useReducedMotion();
  const disc = cn("flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full", MARK_TONE[kind]);

  if (kind === "success") {
    return (
      <motion.span
        className={disc}
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-9 w-9"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.25 }}
          />
        </svg>
      </motion.span>
    );
  }

  const Icon = MARK_ICON[kind];
  return (
    <span className={disc} aria-hidden="true">
      <Icon className={cn("h-8 w-8", kind === "checking" && "animate-spin")} strokeWidth={1.75} />
    </span>
  );
};

const detailRow = "flex items-center justify-between gap-4 py-3.5";
const quietLink =
  "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-semibold text-ink transition-[background-color,transform] duration-300 ease-out-expo hover:bg-ink/[0.07] active:scale-[0.97]";

const PaymentResult: React.FC = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const orderRef = params.get("order") || params.get("order_id");
  const method = (params.get("method") || "card").toLowerCase();
  const isCancel = location.pathname.startsWith("/payment/cancel");
  const navState = (location.state || {}) as { whatsappUrl?: string; opened?: boolean };

  const [cardState, setCardState] = useState<CardState>("checking");
  const [row, setRow] = useState<OrderStatusRow | null>(null);
  const { state: authState } = useAuth();

  // Card payments: poll the server until PayHere's notification marks the order paid.
  useEffect(() => {
    if (isCancel || method !== "card" || !orderRef) return;
    let attempts = 0;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      attempts += 1;
      try {
        const r = await fetchStatus(orderRef);
        if (stopped) return;
        if (r) setRow(r);
        if (r?.payment_status === "paid") return setCardState("paid");
        if (r && ["failed", "cancelled", "chargedback"].includes(r.payment_status)) return setCardState("failed");
      } catch (e) {
        console.warn("Could not check order status", e);
      }
      if (stopped) return;
      if (attempts >= POLL_ATTEMPTS) setCardState("unconfirmed");
      else timer = setTimeout(tick, POLL_INTERVAL_MS);
    };
    tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [isCancel, method, orderRef]);

  const continueShopping = (primary: boolean) => (
    <Button asChild size="lg" variant={primary ? "default" : "outline"}>
      <Link to="/shop">
        Continue shopping
        {primary && <ArrowRight aria-hidden="true" />}
      </Link>
    </Button>
  );
  const myOrders = authState.isAuthenticated ? (
    <Button asChild size="lg" variant="outline">
      <Link to="/my-orders">View my orders</Link>
    </Button>
  ) : null;

  let seoTitle = method === "card" && cardState === "paid" ? "Payment confirmed" : "Thank you for your order";
  let seoDescription = "Your TableLK order status.";
  let mark: Mark;
  let heading: string;
  let body: React.ReactNode;
  let badge: React.ReactNode = null;
  let actions: React.ReactNode = null;

  if (isCancel) {
    seoTitle = "Payment cancelled";
    seoDescription = "Your TableLK payment was cancelled.";
    mark = "cancelled";
    heading = "Payment cancelled, nothing was charged";
    body = <p>Your cart is still saved. You can try again, pay with cash on delivery, or send us your order on WhatsApp.</p>;
    badge = <PaymentStatusBadge status="cancelled" />;
    actions = (
      <>
        <Button asChild size="lg">
          <Link to="/checkout">
            Try checkout again
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a
            href={whatsappLink(
              orderRef
                ? `Hi TableLK, my card payment for order ${orderRef} was cancelled. I'd like to complete my order.`
                : "Hi TableLK, I'd like to place an order."
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden="true" />
            Order on WhatsApp
          </a>
        </Button>
      </>
    );
  } else if (method === "cod") {
    mark = "success";
    heading = "Your order has been placed";
    body = (
      <>
        <p>You'll pay in cash when your order is delivered.</p>
        <ol className="mx-auto mt-6 max-w-[30rem] space-y-3 text-left text-base">
          {[
            "We'll call or WhatsApp you within one working day to confirm your order and delivery date.",
            `Delivery usually takes ${policyConfig.colomboDeliveryDays} in the Western Province and ${policyConfig.outstationDeliveryDays} elsewhere.`,
            "Pay the delivery team in cash when your furniture arrives.",
          ].map((step, i) => (
            <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-x-2">
              <span className="num font-display font-bold text-teak-deep" aria-hidden="true">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </>
    );
    badge = <PaymentMethodBadge method="cod" />;
    actions = (
      <>
        {continueShopping(true)}
        {myOrders}
      </>
    );
  } else if (method === "whatsapp") {
    const waUrl =
      navState.whatsappUrl ||
      whatsappLink(orderRef ? `Hi TableLK, I'd like to confirm my order ${orderRef}.` : "Hi TableLK, I'd like to place an order.");
    mark = "whatsapp";
    heading = "Finish your order on WhatsApp";
    body = (
      <p>
        We've opened WhatsApp with your order details. Press <span className="font-semibold text-ink">Send</span> so we
        receive it. We'll reply to confirm the price, delivery date and payment.
      </p>
    );
    badge = <PaymentMethodBadge method="whatsapp" />;
    actions = (
      <>
        <Button asChild size="lg">
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" />
            {navState.opened === false ? "Open WhatsApp" : "WhatsApp didn't open? Tap here"}
          </a>
        </Button>
        {continueShopping(false)}
      </>
    );
  } else if (!orderRef) {
    mark = "success";
    heading = "Thank you";
    body = <p>If you completed a payment, we'll contact you shortly to confirm your order.</p>;
    actions = continueShopping(true);
  } else if (cardState === "paid") {
    mark = "success";
    heading = "Your order is confirmed";
    body = (
      <p>
        {row?.total ? `We've received your payment of ${formatPrice(Number(row.total))}. ` : "We've received your payment. "}
        We'll call or WhatsApp you to arrange delivery ({policyConfig.colomboDeliveryDays} in the Western Province,{" "}
        {policyConfig.outstationDeliveryDays} elsewhere).
      </p>
    );
    badge = <PaymentStatusBadge status="paid" />;
    actions = (
      <>
        {continueShopping(true)}
        {myOrders}
      </>
    );
  } else if (cardState === "failed") {
    mark = "failed";
    heading = "Payment not completed";
    body = (
      <p>
        Your bank or PayHere reported that this payment didn't go through. If money was deducted, it will be returned.
        Please contact us with your order reference.
      </p>
    );
    badge = <PaymentStatusBadge status={row?.payment_status || "failed"} />;
    actions = (
      <Button asChild size="lg">
        <Link to="/checkout">
          Try again
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    );
  } else if (cardState === "checking") {
    mark = "checking";
    heading = "Confirming your payment";
    body = <p>This usually takes a few seconds. Please don't close this page.</p>;
    badge = <PaymentStatusBadge status="pending" />;
  } else {
    mark = "pending";
    heading = "We're confirming your payment";
    body = (
      <p>
        It can take a little while for the bank to confirm. There's no need to pay again. You'll get a call or WhatsApp
        from us once it's confirmed.
      </p>
    );
    badge = <PaymentStatusBadge status="pending" />;
    actions = continueShopping(false);
  }

  const showTotal = !isCancel && method === "card" && !!row?.total;

  return (
    <Layout>
      <SEOHead title={`${seoTitle} | TableLK`} description={seoDescription} />
      <div className="shell">
        <div className="mx-auto flex max-w-[35rem] flex-col items-center pt-12 text-center md:pt-20" aria-live="polite">
          <StatusMark key={mark} kind={mark} />
          <h1 className="display-md mt-7">{heading}</h1>
          <div className="mt-4 text-steel md:text-lg">{body}</div>

          {orderRef && (
            <div className="mt-9 w-full">
              <dl className="divide-y divide-ink/10 border-y border-ink/15 text-left">
                <div className={detailRow}>
                  <dt className="shrink-0 text-steel">Order reference</dt>
                  <dd className="num break-all text-right text-lg font-semibold">{orderRef}</dd>
                </div>
                {badge && (
                  <div className={detailRow}>
                    <dt className="text-steel">Payment</dt>
                    <dd>{badge}</dd>
                  </div>
                )}
                {showTotal && (
                  <div className={detailRow}>
                    <dt className="text-steel">Total</dt>
                    <dd className="num font-semibold">{formatPrice(Number(row!.total))}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-sm text-steel">Please keep this for any questions about your order.</p>
            </div>
          )}

          {actions && <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">{actions}</div>}

          <div className="mt-12 w-full border-t border-ink/10 pt-6">
            <p className="text-sm text-steel">
              Questions about your order? <span className="inline-block">We answer {policyConfig.businessHours.charAt(0).toLowerCase() + policyConfig.businessHours.slice(1)}.</span>
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-2">
              <a href={policyConfig.phoneHref} className={quietLink}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span className="num">{policyConfig.phone}</span>
              </a>
              <a
                href={whatsappLink(
                  orderRef ? `Hi TableLK, I have a question about my order ${orderRef}.` : "Hi TableLK, I have a question about my order."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={quietLink}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
