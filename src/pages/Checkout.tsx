import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  Lock,
  MessageCircle,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PaymentBadges from "@/components/PaymentBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { Product, products as staticProducts } from "@/lib/data";
import {
  policyConfig,
  SRI_LANKA_DISTRICTS,
  WESTERN_DISTRICTS,
  deliveryFeeFor,
  whatsappLink,
} from "@/lib/policyConfig";
import { saveOrder, generateOrderRef } from "@/lib/saveOrder";
import { createCardCheckout, startPayHerePayment } from "@/lib/payhere";
import { formatPrice } from "@/lib/format";
import { EASE_OUT } from "@/components/motion";
import { cn } from "@/lib/utils";

type PaymentMethod = "card" | "cod" | "whatsapp";

interface BuyNowState {
  productId: string | number;
  quantity?: number;
  color?: string;
}

interface Line {
  product: Product;
  quantity: number;
  color?: string;
}

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const FIELD_ORDER: (keyof FormValues)[] = ["firstName", "lastName", "phone", "email", "address", "city", "district"];

const cleanPhone = (v: string) => v.replace(/[\s\-().]/g, "");
const isLkPhone = (v: string) => /^(?:\+94|94|0)\d{9}$/.test(cleanPhone(v));
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
/** Card checkout needs database products (uuid ids); the static fallback list uses small numbers. */
const isDbProductId = (id: Product["id"]) => typeof id === "string" && !/^\d+$/.test(id);

const METHODS: { id: PaymentMethod; title: string; description: string; icon: React.ElementType }[] = [
  {
    id: "card",
    title: "Credit or debit card",
    description: "Visa, Mastercard or Amex. Secured by PayHere.",
    icon: CreditCard,
  },
  {
    id: "cod",
    title: "Cash on delivery",
    description: "Pay in cash when your order arrives.",
    icon: Banknote,
  },
  {
    id: "whatsapp",
    title: "Order on WhatsApp",
    description: "Send us the order on WhatsApp and we'll confirm the details.",
    icon: MessageCircle,
  },
];

/** Border override for a field that failed validation. */
const invalid = (error?: string) => (error ? "border-destructive hover:border-destructive" : undefined);

const Field: React.FC<{
  id: keyof FormValues;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ id, label, error, hint, optional, className, children }) => (
  <div className={cn("min-w-0", className)}>
    <Label htmlFor={id} className="mb-2 block">
      {label}
      {optional && <span className="ml-1.5 font-normal text-steel">(optional)</span>}
    </Label>
    {children}
    <AnimatePresence initial={false}>
      {error && (
        <motion.p
          key="error"
          id={`${id}-error`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="overflow-hidden text-sm font-medium text-destructive"
        >
          <span className="flex items-start gap-1.5 pt-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
    {!error && hint && <p className="pt-2 text-sm text-steel">{hint}</p>}
  </div>
);

const Step: React.FC<{ n: number; title: string; aside?: React.ReactNode; children: React.ReactNode }> = ({
  n,
  title,
  aside,
  children,
}) => (
  <section aria-labelledby={`checkout-step-${n}`} className="border-t border-ink/15 pt-7 md:pt-9">
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 id={`checkout-step-${n}`} className="flex items-baseline gap-3 text-[1.375rem] md:text-2xl">
        <span className="num text-teak-deep" aria-hidden="true">
          {n}
        </span>
        {title}
      </h2>
      {aside}
    </div>
    {children}
  </section>
);

const DESKTOP_QUERY = "(min-width: 1024px)";

/** True from the "lg" breakpoint up, where the order summary is always open beside the form. */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { state: authState } = useAuth();
  const { data: productList, isLoading: productsLoading } = useProducts();

  const buyNow = (location.state as { buyNow?: BuyNowState } | null)?.buyNow;
  const fromCart = !buyNow;

  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [formError, setFormError] = useState<{ message: string; suggest: PaymentMethod[] } | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const submittingRef = useRef(false);
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();

  // Prefill name and email for signed-in customers.
  useEffect(() => {
    const user = authState.user;
    if (!user) return;
    const [first, ...rest] = (user.name || "").trim().split(/\s+/);
    setValues((v) => ({
      ...v,
      firstName: v.firstName || first || "",
      lastName: v.lastName || rest.join(" "),
      email: v.email || user.email || "",
    }));
  }, [authState.user]);

  // Items being bought, with prices refreshed from the current product list when available.
  const lines: Line[] = useMemo(() => {
    const findProduct = (id: Product["id"]) =>
      productList?.find((p) => String(p.id) === String(id)) ??
      staticProducts.find((p) => String(p.id) === String(id));
    if (buyNow) {
      const product = findProduct(buyNow.productId);
      if (!product) return [];
      const quantity = Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(Number(buyNow.quantity) || 1)));
      return [{ product, quantity, color: buyNow.color || product.colors?.[0] }];
    }
    return cartState.items.map((item) => ({
      product: productList?.find((p) => String(p.id) === String(item.product.id)) ?? item.product,
      quantity: item.quantity,
      color: item.color,
    }));
  }, [buyNow, cartState.items, productList]);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const deliveryFee = values.district ? deliveryFeeFor(values.district) : null;
  const total = subtotal + (deliveryFee ?? 0);
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const isWestern = (WESTERN_DISTRICTS as readonly string[]).includes(values.district);
  const deliveryTime = values.district
    ? isWestern
      ? policyConfig.colomboDeliveryDays
      : policyConfig.outstationDeliveryDays
    : `${policyConfig.colomboDeliveryDays} (Western Province), ${policyConfig.outstationDeliveryDays} elsewhere`;

  const set = (field: keyof FormValues) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!values.firstName.trim()) e.firstName = "Please enter your first name";
    if (!values.lastName.trim()) e.lastName = "Please enter your last name";
    if (!values.phone.trim()) e.phone = "Please enter a phone number we can call";
    else if (!isLkPhone(values.phone)) e.phone = "Enter a Sri Lankan number, e.g. 077 123 4567";
    if (method === "card" && !values.email.trim()) e.email = "Email is required for card payments (for your receipt)";
    else if (values.email.trim() && !isEmail(values.email)) e.email = "Please enter a valid email address";
    if (!values.address.trim()) e.address = "Please enter your delivery address";
    if (!values.city.trim()) e.city = "Please enter your city / town";
    if (!values.district) e.district = "Please select your district";
    return e;
  };

  const release = () => {
    submittingRef.current = false;
    setSubmitting(false);
  };

  const finish = (orderRef: string, query: string, state?: unknown) => {
    setPlaced(true);
    if (fromCart) clearCart({ silent: true });
    navigate(`/payment/success?order=${encodeURIComponent(orderRef)}${query}`, { replace: true, state });
  };

  const customerName = () => `${values.firstName.trim()} ${values.lastName.trim()}`;
  const orderItems = () =>
    lines.map((l) => ({
      product_id: l.product.id,
      name: l.product.name,
      price: l.product.price,
      quantity: l.quantity,
      ...(l.color ? { color: l.color } : {}),
    }));
  const orderRecord = (order_ref: string, payment_method: "cod" | "whatsapp") => ({
    order_ref,
    customer_name: customerName(),
    customer_phone: values.phone.trim(),
    customer_email: values.email.trim(),
    shipping_address: values.address.trim(),
    city: values.city.trim(),
    district: values.district,
    notes: values.notes.trim(),
    subtotal,
    delivery_fee: deliveryFee ?? 0,
    total,
    items: orderItems(),
    payment_method,
  });

  const whatsappMessage = (ref: string, paymentNote: string) =>
    [
      `New order ${ref}`,
      "",
      "Items:",
      ...lines.map(
        (l) =>
          `- ${l.product.name}${l.color ? ` (${l.color})` : ""} x ${l.quantity} = ${formatPrice(l.product.price * l.quantity)}`
      ),
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery: ${deliveryFee ? formatPrice(deliveryFee) : "Free"}`,
      `Total: ${formatPrice(total)}`,
      `Payment: ${paymentNote}`,
      "",
      `Name: ${customerName()}`,
      `Phone: ${values.phone.trim()}`,
      ...(values.email.trim() ? [`Email: ${values.email.trim()}`] : []),
      `Address: ${values.address.trim()}, ${values.city.trim()}, ${values.district}`,
      ...(values.notes.trim() ? [`Notes: ${values.notes.trim()}`] : []),
    ].join("\n");

  const payByCard = async () => {
    if (!lines.every((l) => isDbProductId(l.product.id))) {
      release();
      setFormError({
        message: "Card payment isn't available for this item right now. Please choose Cash on delivery or order via WhatsApp.",
        suggest: ["cod", "whatsapp"],
      });
      return;
    }
    try {
      const res = await createCardCheckout({
        items: lines.map((l) => ({
          product_id: String(l.product.id),
          quantity: l.quantity,
          ...(l.color ? { color: l.color } : {}),
        })),
        customer: {
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          email: values.email.trim(),
          phone: cleanPhone(values.phone),
          address: values.address.trim(),
          city: values.city.trim(),
          district: values.district,
        },
        notes: values.notes.trim() || undefined,
      });
      await startPayHerePayment(res.payment, {
        onCompleted: () => finish(res.order_ref, ""),
        onDismissed: () => {
          release();
          toast(fromCart ? "Payment cancelled — your cart is saved" : "Payment cancelled — nothing was charged");
        },
        onError: (err) => {
          release();
          toast.error(`Payment error: ${err || "please try again"}`);
        },
      });
    } catch (err: any) {
      release();
      setFormError({
        message: `${err?.message || "Card payment could not be started."} You can still order with Cash on delivery or via WhatsApp.`,
        suggest: ["cod", "whatsapp"],
      });
    }
  };

  const placeCod = async () => {
    const result = await saveOrder(orderRecord(generateOrderRef(), "cod"));
    if (!result.ok) {
      release();
      setFormError({
        message: "We couldn't place your order just now. Please try again, or send the order to us on WhatsApp.",
        suggest: ["whatsapp"],
      });
      return;
    }
    finish(result.order_ref, "&method=cod");
  };

  const placeWhatsApp = async () => {
    const ref = generateOrderRef();
    const url = whatsappLink(whatsappMessage(ref, "To be confirmed on WhatsApp"));
    // Start saving, but open WhatsApp straight away (inside the click) so popup blockers allow it.
    const saving = saveOrder(orderRecord(ref, "whatsapp"));
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    const result = await saving;
    if (!result.ok) console.warn("WhatsApp order was not saved:", result.error);
    finish(ref, "&method=whatsapp", { whatsappUrl: url, opened: !!win });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setFormError(null);
    const found = validate();
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((f) => found[f]);
    if (firstInvalid) {
      const el = document.getElementById(firstInvalid);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }
    if (!lines.length) return;

    submittingRef.current = true;
    setSubmitting(true);
    if (method === "whatsapp") return placeWhatsApp();
    if (method === "cod") return placeCod();
    return payByCard();
  };

  const submitLabel =
    method === "card"
      ? `Pay ${formatPrice(total)} by card`
      : method === "cod"
        ? "Place order: cash on delivery"
        : "Send order on WhatsApp";
  const SubmitIcon = method === "card" ? Lock : method === "whatsapp" ? MessageCircle : ArrowRight;

  // ---------- states without a form ----------
  const loading = buyNow ? productsLoading : cartState.isLoading;

  const frame = (children: React.ReactNode) => (
    <Layout>
      <SEOHead title="Checkout | TableLK" description="Secure checkout for TableLK furniture orders." />
      <div className="shell pt-8 md:pt-12">
        <h1 className="display-lg">Checkout</h1>
        <p className="mt-3 flex items-center gap-2 text-[0.9375rem] text-steel">
          <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Secure checkout · Island-wide delivery
        </p>
        <div className="mt-8 md:mt-12">{children}</div>
      </div>
    </Layout>
  );

  if (placed || (loading && !lines.length)) {
    return frame(
      <div role="status" className="flex items-center gap-3 border-t border-ink/15 py-16 text-steel">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        {placed ? "Finishing your order" : "Loading your order"}
      </div>
    );
  }

  if (!lines.length) {
    return frame(
      <div className="border-t border-ink/15 pt-10 md:pt-14">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teak-tint text-teak-deep">
          <ShoppingBag className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 className="display-md mt-6">{buyNow ? "This product isn't available" : "Your cart is empty"}</h2>
        <p className="mt-3 max-w-[46ch] text-steel md:text-lg">
          {buyNow
            ? "It may have been removed or renamed. Have a look at our other tables."
            : "Add a table or two to your cart and come back here to check out."}
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/shop">
            Browse tables
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  // ---------- summary ----------
  const summaryShown = isDesktop || summaryOpen;
  const longList = lines.length > 4;

  const summary = (
    <div className="rounded-2xl border border-ink/10 bg-card">
      <button
        type="button"
        className="flex min-h-[3.75rem] w-full items-center justify-between gap-3 rounded-2xl px-5 text-left transition-colors duration-300 active:bg-ink/[0.04] lg:hidden"
        onClick={() => setSummaryOpen((o) => !o)}
        aria-expanded={summaryOpen}
        aria-controls="order-summary"
      >
        <span className="flex items-center gap-2 font-semibold">
          {summaryOpen ? "Hide" : "Show"} order summary
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-300 ease-out-expo", summaryOpen && "rotate-180")}
            aria-hidden="true"
          />
        </span>
        <span className="num whitespace-nowrap font-display text-lg font-bold">{formatPrice(total)}</span>
      </button>

      <AnimatePresence initial={false}>
        {summaryShown && (
          <motion.div
            key="summary"
            id="order-summary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink/10 p-5 lg:border-t-0 lg:p-7">
              <h2 className="mb-5 hidden text-xl lg:block">
                Order summary
                <span className="num ml-2 font-sans text-[0.9375rem] font-normal tracking-normal text-steel">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </h2>
              <ul
                className={cn("space-y-4", longList && "lg:max-h-[38vh] lg:overflow-y-auto lg:overscroll-contain lg:pr-2")}
                {...(longList ? { "data-lenis-prevent": "" } : {})}
              >
                {lines.map((l) => (
                  <li key={`${l.product.id}-${l.color || ""}`} className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-ash">
                      <img
                        src={l.product.images?.[0] || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement;
                          t.onerror = null;
                          t.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug">{l.product.name}</p>
                      <p className="num mt-1 text-sm text-steel">
                        {l.color ? `${l.color} · ` : ""}
                        <span className="whitespace-nowrap">
                          Qty {l.quantity} × {formatPrice(l.product.price)}
                        </span>
                      </p>
                    </div>
                    <p className="num whitespace-nowrap text-[0.9375rem] font-semibold">
                      {formatPrice(l.product.price * l.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-2.5 border-t border-ink/10 pt-5 text-[0.9375rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">Subtotal</dt>
                  <dd className="num">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-steel">Delivery</dt>
                  <dd className={cn("num", deliveryFee === 0 && "font-semibold text-teak-deep", deliveryFee === null && "text-steel")}>
                    {deliveryFee === null ? "Select district" : deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
                  <dt className="text-base font-semibold">Total</dt>
                  <dd className="num font-display text-2xl font-bold tracking-[-0.02em]">{formatPrice(total)}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm text-steel">
                <p className="flex items-start gap-2">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-teak-deep" aria-hidden="true" />
                  <span>
                    Expected delivery: <span className="font-medium text-ink">{deliveryTime}</span>
                  </span>
                </p>
                <p className="pl-6">
                  {policyConfig.returnWindowDays}-day returns on standard items.{" "}
                  <Link
                    to="/return-policy"
                    target="_blank"
                    className="font-medium text-ink underline underline-offset-4 hover:text-teak-deep"
                  >
                    Return &amp; Refund Policy
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ---------- page ----------
  return frame(
    <div className="grid grid-cols-1 items-start gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_25rem] xl:gap-x-24">
      <aside aria-label="Order summary" className="min-w-0 lg:sticky lg:top-header lg:order-2">
        {summary}
      </aside>

      <form onSubmit={onSubmit} noValidate className="min-w-0 space-y-10 md:space-y-12 lg:order-1">
        <Step
          n={1}
          title="Contact"
          aside={
            !authState.isAuthenticated && (
              <p className="text-sm text-steel">
                No account needed.{" "}
                <Link to="/login" className="font-medium text-ink underline underline-offset-4 hover:text-teak-deep">
                  Log in
                </Link>{" "}
                to track orders.
              </p>
            )
          }
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field id="firstName" label="First name" error={errors.firstName}>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(e) => set("firstName")(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                className={invalid(errors.firstName)}
              />
            </Field>
            <Field id="lastName" label="Last name" error={errors.lastName}>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(e) => set("lastName")(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                className={invalid(errors.lastName)}
              />
            </Field>
            <Field id="phone" label="Phone" error={errors.phone} hint="A Sri Lankan number. We'll call to arrange delivery.">
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="077 123 4567"
                value={values.phone}
                onChange={(e) => set("phone")(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={invalid(errors.phone)}
              />
            </Field>
            <Field
              id="email"
              label="Email"
              optional={method !== "card"}
              error={errors.email}
              hint={method === "card" ? "We'll send your payment receipt here." : undefined}
            >
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email")(e.target.value)}
                aria-required={method === "card"}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={invalid(errors.email)}
              />
            </Field>
          </div>
        </Step>

        <Step n={2} title="Delivery address">
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field id="address" label="Address" error={errors.address} className="sm:col-span-2">
              <Textarea
                id="address"
                rows={2}
                autoComplete="street-address"
                placeholder="House no., street, area"
                value={values.address}
                onChange={(e) => set("address")(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "address-error" : undefined}
                className={cn("min-h-[5.5rem]", invalid(errors.address))}
              />
            </Field>
            <Field id="city" label="City or town" error={errors.city}>
              <Input
                id="city"
                autoComplete="address-level2"
                value={values.city}
                onChange={(e) => set("city")(e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "city-error" : undefined}
                className={invalid(errors.city)}
              />
            </Field>
            <Field id="district" label="District" error={errors.district}>
              <Select value={values.district} onValueChange={set("district")}>
                <SelectTrigger
                  id="district"
                  aria-required="true"
                  aria-invalid={!!errors.district}
                  aria-describedby={errors.district ? "district-error" : undefined}
                  className={cn(!values.district && "text-steel", invalid(errors.district))}
                >
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="max-h-72 rounded-xl">
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d} className="min-h-11 rounded-lg text-base">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="notes" label="Order notes" optional className="sm:col-span-2">
              <Textarea
                id="notes"
                rows={2}
                placeholder="Landmarks, preferred delivery time, size changes"
                value={values.notes}
                onChange={(e) => set("notes")(e.target.value)}
                className="min-h-[5.5rem]"
              />
            </Field>
          </div>
        </Step>

        <Step n={3} title="Payment method">
          <RadioGroup
            value={method}
            onValueChange={(v) => {
              setMethod(v as PaymentMethod);
              setFormError(null);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            className="gap-3"
            aria-label="Payment method"
          >
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <RadioGroupPrimitive.Item
                  key={m.id}
                  value={m.id}
                  id={`pm-${m.id}`}
                  className={cn(
                    "flex min-h-[4.5rem] w-full items-center gap-4 rounded-xl border bg-card px-4 py-3.5 text-left transition-[border-color,box-shadow,transform] duration-300 ease-out-expo active:scale-[0.99] md:px-5",
                    active
                      ? "border-ink shadow-[inset_0_0_0_1px_hsl(var(--ink))]"
                      : "border-input hover:border-ink/50"
                  )}
                >
                  <Icon className="h-6 w-6 shrink-0 text-ink" strokeWidth={1.5} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{m.title}</span>
                    <span className="mt-0.5 block text-sm text-steel">{m.description}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-300 ease-out-expo",
                      active ? "border-teak bg-teak text-ink" : "border-ink/30 bg-transparent text-transparent"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300 ease-out-expo",
                        active ? "scale-100" : "scale-50"
                      )}
                      strokeWidth={3}
                    />
                  </span>
                </RadioGroupPrimitive.Item>
              );
            })}
          </RadioGroup>
        </Step>

        <section aria-label="Place your order" className="border-t border-ink/15 pt-7 md:pt-9">
          <AnimatePresence initial={false}>
            {formError && (
              <motion.div
                key="form-error"
                role="alert"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div className="mb-6 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/[0.06] p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-medium text-destructive">{formError.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formError.suggest.map((s) => (
                        <Button
                          key={s}
                          type="button"
                          variant="outline"
                          className="bg-card"
                          onClick={() => {
                            setMethod(s);
                            setFormError(null);
                          }}
                        >
                          {s === "cod" ? "Use cash on delivery" : "Order on WhatsApp"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-5 flex items-baseline justify-between gap-4 lg:hidden">
            <span className="font-semibold">Total</span>
            <span className="num font-display text-2xl font-bold tracking-[-0.02em]">{formatPrice(total)}</span>
          </div>

          <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {method === "card" ? "Opening secure payment" : "Placing your order"}
              </>
            ) : (
              <>
                <SubmitIcon aria-hidden="true" />
                {submitLabel}
              </>
            )}
          </Button>

          <p className="mx-auto mt-4 max-w-[60ch] text-center text-sm text-steel">
            By placing this order you agree to our{" "}
            <Link to="/terms-and-conditions" className="text-ink underline underline-offset-4 hover:text-teak-deep" target="_blank">
              Terms &amp; Conditions
            </Link>
            ,{" "}
            <Link to="/return-policy" className="text-ink underline underline-offset-4 hover:text-teak-deep" target="_blank">
              Return &amp; Refund Policy
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="text-ink underline underline-offset-4 hover:text-teak-deep" target="_blank">
              Privacy Policy
            </Link>
            .
          </p>

          <PaymentBadges className="mt-6 flex flex-col items-center [&>div]:justify-center [&>p]:justify-center" />
        </section>
      </form>
    </div>
  );
};

export default Checkout;
