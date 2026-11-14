import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, Loader2, Phone, MessageCircle, AlertTriangle } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";

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

const formatPrice = (price: number) => `LKR ${Number(price).toLocaleString("en-LK")}`;

const fetchStatus = async (ref: string): Promise<OrderStatusRow | null> => {
  const { data, error } = await (supabase as any).rpc("get_order_status", { _order_ref: ref });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? null;
};

const ContactLine: React.FC<{ orderRef?: string | null }> = ({ orderRef }) => (
  <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
    <Button variant="outline" asChild>
      <a href={policyConfig.phoneHref}>
        <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
        {policyConfig.phone}
      </a>
    </Button>
    <Button variant="outline" asChild>
      <a
        href={whatsappLink(orderRef ? `Hi TableLK, I have a question about my order ${orderRef}.` : "Hi TableLK, I have a question about my order.")}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
        WhatsApp us
      </a>
    </Button>
  </div>
);

const Header: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="bg-primary/10 py-10 md:py-12">
    <div className="container mx-auto px-6 text-center">
      <h1 className="text-3xl md:text-4xl font-serif font-bold">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);

const RefBox: React.FC<{ orderRef: string }> = ({ orderRef }) => (
  <div className="mx-auto mb-6 w-full max-w-sm rounded-lg border bg-card p-4 text-center">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">Order reference</p>
    <p className="mt-1 break-all font-mono text-xl font-semibold">{orderRef}</p>
    <p className="mt-1 text-xs text-muted-foreground">Please keep this for any questions about your order.</p>
  </div>
);

const CancelView: React.FC<{ orderRef: string | null }> = ({ orderRef }) => (
  <Layout>
    <SEOHead title="Payment cancelled | TableLK" description="Your TableLK payment was cancelled." />
    <Header title="Payment cancelled" />
    <div className="container mx-auto max-w-xl px-6 py-12 text-center">
      <XCircle className="mx-auto mb-4 h-14 w-14 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-2xl font-serif font-bold">Payment was cancelled, nothing was charged</h2>
      <p className="mt-3 text-muted-foreground">
        Your cart is still saved. You can try again, pay with Cash on delivery, or send us your order on WhatsApp.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link to="/checkout">Try checkout again</Link>
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
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Order on WhatsApp
          </a>
        </Button>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Need help? Call us on{" "}
        <a href={policyConfig.phoneHref} className="font-medium text-foreground underline underline-offset-2">
          {policyConfig.phone}
        </a>{" "}
        ({policyConfig.businessHours}).
      </p>
    </div>
  </Layout>
);

const PaymentResult: React.FC = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const orderRef = params.get("order") || params.get("order_id");
  const method = (params.get("method") || "card").toLowerCase();
  const isCancel = location.pathname.startsWith("/payment/cancel");
  const navState = (location.state || {}) as { whatsappUrl?: string; opened?: boolean };

  const [cardState, setCardState] = useState<CardState>("checking");
  const [row, setRow] = useState<OrderStatusRow | null>(null);

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

  if (isCancel) return <CancelView orderRef={orderRef} />;

  const title = method === "card" && cardState === "paid" ? "Payment confirmed" : "Thank you for your order";

  let body: React.ReactNode;
  if (method === "cod") {
    body = (
      <>
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold">Your order has been placed</h2>
        <p className="mt-3 text-muted-foreground">You'll pay in cash when your order is delivered.</p>
        <ol className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-muted-foreground list-decimal pl-5">
          <li>We'll call or WhatsApp you within one working day to confirm your order and delivery date.</li>
          <li>
            Delivery usually takes {policyConfig.colomboDeliveryDays} in the Western Province and{" "}
            {policyConfig.outstationDeliveryDays} elsewhere.
          </li>
          <li>Pay the delivery team in cash when your furniture arrives.</li>
        </ol>
      </>
    );
  } else if (method === "whatsapp") {
    const waUrl =
      navState.whatsappUrl ||
      whatsappLink(orderRef ? `Hi TableLK, I'd like to confirm my order ${orderRef}.` : "Hi TableLK, I'd like to place an order.");
    body = (
      <>
        <MessageCircle className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold">Finish your order on WhatsApp</h2>
        <p className="mt-3 text-muted-foreground">
          We've opened WhatsApp with your order details. Press <span className="font-medium text-foreground">Send</span> so
          we receive it — we'll reply to confirm the price, delivery date and payment.
        </p>
        <Button asChild size="lg" className="mt-6 bg-green-600 hover:bg-green-700">
          <a href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            {navState.opened === false ? "Open WhatsApp" : "WhatsApp didn't open? Tap here"}
          </a>
        </Button>
      </>
    );
  } else if (!orderRef) {
    body = (
      <>
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold">Thank you</h2>
        <p className="mt-3 text-muted-foreground">
          If you completed a payment, we'll contact you shortly to confirm your order.
        </p>
      </>
    );
  } else if (cardState === "paid") {
    body = (
      <>
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold">Your order is confirmed</h2>
        <p className="mt-3 text-muted-foreground">
          {row?.total ? `We've received your payment of ${formatPrice(row.total)}. ` : "We've received your payment. "}
          We'll call or WhatsApp you to arrange delivery ({policyConfig.colomboDeliveryDays} in the Western Province,{" "}
          {policyConfig.outstationDeliveryDays} elsewhere).
        </p>
      </>
    );
  } else if (cardState === "failed") {
    body = (
      <>
        <AlertTriangle className="mx-auto mb-4 h-14 w-14 text-amber-600" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold">Payment not completed</h2>
        <p className="mt-3 text-muted-foreground">
          Your bank or PayHere reported that this payment didn't go through. If money was deducted, it will be returned —
          please contact us with your order reference.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/checkout">Try again</Link>
        </Button>
      </>
    );
  } else if (cardState === "checking") {
    body = (
      <>
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold">Confirming your payment...</h2>
        <p className="mt-3 text-muted-foreground">This usually takes a few seconds. Please don't close this page.</p>
      </>
    );
  } else {
    body = (
      <>
        <Clock className="mx-auto mb-4 h-14 w-14 text-amber-600" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold">We're confirming your payment</h2>
        <p className="mt-3 text-muted-foreground">
          It can take a little while for the bank to confirm. There's no need to pay again — you'll get a call or WhatsApp
          from us once it's confirmed.
        </p>
      </>
    );
  }

  return (
    <Layout>
      <SEOHead title={`${title} | TableLK`} description="Your TableLK order status." />
      <Header title={title} />
      <div className="container mx-auto max-w-xl px-6 py-12 text-center" aria-live="polite">
        {orderRef && <RefBox orderRef={orderRef} />}
        {body}
        <ContactLine orderRef={orderRef} />
        <p className="mt-4 text-xs text-muted-foreground">{policyConfig.businessHours}</p>
        <div className="mt-8">
          <Button variant="link" asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
