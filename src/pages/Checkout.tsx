import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, CreditCard, Banknote, MessageCircle, Loader2, ShoppingBag, Lock, Truck } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PaymentBadges from "@/components/PaymentBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const formatPrice = (price: number) => `LKR ${price.toLocaleString("en-LK")}`;
const cleanPhone = (v: string) => v.replace(/[\s\-().]/g, "");
const isLkPhone = (v: string) => /^(?:\+94|94|0)\d{9}$/.test(cleanPhone(v));
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
/** Card checkout needs database products (uuid ids); the static fallback list uses small numbers. */
const isDbProductId = (id: Product["id"]) => typeof id === "string" && !/^\d+$/.test(id);

const METHODS: { id: PaymentMethod; title: string; description: string; icon: React.ElementType }[] = [
  {
    id: "card",
    title: "Credit / Debit card",
    description: "Visa, Mastercard, Amex — secured by PayHere",
    icon: CreditCard,
  },
  {
    id: "cod",
    title: "Cash on delivery",
    description: "Pay in cash when your order arrives",
    icon: Banknote,
  },
  {
    id: "whatsapp",
    title: "Order via WhatsApp",
    description: "Send your order to us on WhatsApp and we'll confirm the details",
    icon: MessageCircle,
  },
];

const Field: React.FC<{
  id: keyof FormValues;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}> = ({ id, label, error, hint, optional, children }) => (
  <div className="space-y-1.5 min-w-0">
    <Label htmlFor={id}>
      {label}
      {optional ? <span className="ml-1 font-normal text-muted-foreground">(optional)</span> : <span className="text-destructive"> *</span>}
    </Label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-sm text-destructive">
        {error}
      </p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

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
    method === "card" ? `Pay ${formatPrice(total)}` : method === "cod" ? "Place order" : "Send order on WhatsApp";

  // ---------- states without a form ----------
  const loading = buyNow ? productsLoading : cartState.isLoading;

  const shell = (children: React.ReactNode) => (
    <Layout>
      <SEOHead title="Checkout | TableLK" description="Secure checkout for TableLK furniture orders." />
      <div className="bg-primary/10 py-8 md:py-10">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Checkout</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Secure checkout · Island-wide delivery
          </p>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">{children}</div>
    </Layout>
  );

  if (placed || (loading && !lines.length)) {
    return shell(
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-3" aria-hidden="true" />
        {placed ? "Finishing your order..." : "Loading..."}
      </div>
    );
  }

  if (!lines.length) {
    return shell(
      <div className="mx-auto max-w-md py-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
        <h2 className="text-2xl font-serif font-bold mb-2">
          {buyNow ? "This product isn't available" : "Your cart is empty"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {buyNow
            ? "It may have been removed or renamed. Have a look at our other tables."
            : "Add a table or two to your cart and come back here to check out."}
        </p>
        <Button asChild size="lg">
          <Link to="/shop">Browse tables</Link>
        </Button>
      </div>
    );
  }

  // ---------- summary ----------
  const summary = (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left lg:hidden"
        onClick={() => setSummaryOpen((o) => !o)}
        aria-expanded={summaryOpen}
        aria-controls="order-summary"
      >
        <span className="font-medium">
          {summaryOpen ? "Hide" : "Show"} order summary ({itemCount} {itemCount === 1 ? "item" : "items"})
        </span>
        <span className="flex items-center gap-2 font-semibold whitespace-nowrap">
          {formatPrice(total)}
          <ChevronDown className={cn("h-4 w-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden="true" />
        </span>
      </button>
      <div id="order-summary" className={cn("border-t p-4 sm:p-5 lg:border-t-0 lg:block", summaryOpen ? "block" : "hidden")}>
        <h2 className="hidden lg:block text-xl font-serif font-bold mb-4">Order summary</h2>
        <ul className="space-y-4">
          {lines.map((l) => (
            <li key={`${l.product.id}-${l.color || ""}`} className="flex gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-secondary/30">
                <img
                  src={l.product.images?.[0] || "/placeholder.svg"}
                  alt={l.product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.onerror = null;
                    t.src = "/placeholder.svg";
                  }}
                />
                <span className="absolute -right-0 -top-0 rounded-bl-md bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {l.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug line-clamp-2">{l.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {l.color ? `${l.color} · ` : ""}Qty {l.quantity} × {formatPrice(l.product.price)}
                </p>
              </div>
              <p className="text-sm font-medium whitespace-nowrap">{formatPrice(l.product.price * l.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className={cn(deliveryFee === 0 && "font-medium text-green-700", deliveryFee === null && "text-muted-foreground")}>
              {deliveryFee === null ? "Select district" : deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="text-primary">{formatPrice(total)}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-2 rounded-md bg-secondary/40 p-3 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <Truck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Expected delivery: <span className="text-foreground">{deliveryTime}</span>
            </span>
          </p>
          <p>
            {policyConfig.returnWindowDays}-day returns on standard items —{" "}
            <Link to="/return-policy" target="_blank" className="underline underline-offset-2 hover:text-foreground">
              Return &amp; Refund Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  // ---------- page ----------
  return shell(
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <aside className="min-w-0 lg:order-2 lg:sticky lg:top-28">{summary}</aside>

      <form onSubmit={onSubmit} noValidate className="min-w-0 space-y-8 lg:order-1">
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-serif font-bold">Contact &amp; delivery details</h2>
            {!authState.isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                No account needed ·{" "}
                <Link to="/login" className="underline underline-offset-2 hover:text-foreground">
                  Log in
                </Link>{" "}
                to track orders
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name" error={errors.firstName}>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(e) => set("firstName")(e.target.value)}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
              />
            </Field>
            <Field id="lastName" label="Last name" error={errors.lastName}>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(e) => set("lastName")(e.target.value)}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
              />
            </Field>
            <Field id="phone" label="Phone" error={errors.phone} hint="Sri Lankan number, e.g. 077 123 4567 — we'll call to arrange delivery">
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="077 123 4567"
                value={values.phone}
                onChange={(e) => set("phone")(e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
            </Field>
            <Field
              id="email"
              label="Email"
              optional={method !== "card"}
              error={errors.email}
              hint={method === "card" ? "We'll send your payment receipt here" : undefined}
            >
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email")(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </Field>
          </div>

          <Field id="address" label="Delivery address" error={errors.address}>
            <Textarea
              id="address"
              rows={2}
              autoComplete="street-address"
              placeholder="House no., street, area"
              value={values.address}
              onChange={(e) => set("address")(e.target.value)}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="city" label="City / town" error={errors.city}>
              <Input
                id="city"
                autoComplete="address-level2"
                value={values.city}
                onChange={(e) => set("city")(e.target.value)}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "city-error" : undefined}
              />
            </Field>
            <Field id="district" label="District" error={errors.district}>
              <Select value={values.district} onValueChange={set("district")}>
                <SelectTrigger
                  id="district"
                  aria-invalid={!!errors.district}
                  aria-describedby={errors.district ? "district-error" : undefined}
                  className={cn(errors.district && "border-destructive")}
                >
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field id="notes" label="Order notes" optional>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Landmarks, preferred delivery time, size changes..."
              value={values.notes}
              onChange={(e) => set("notes")(e.target.value)}
            />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold">Payment method</h2>
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
                <Label
                  key={m.id}
                  htmlFor={`pm-${m.id}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors",
                    active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-secondary/50"
                  )}
                >
                  <RadioGroupItem value={m.id} id={`pm-${m.id}`} className="mt-1 shrink-0" />
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block font-medium">{m.title}</span>
                    <span className="block text-sm text-muted-foreground">{m.description}</span>
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </section>

        <section className="space-y-3">
          {formError && (
            <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <p className="text-destructive">{formError.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {formError.suggest.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMethod(s);
                      setFormError(null);
                    }}
                  >
                    {s === "cod" ? "Use Cash on delivery" : "Order via WhatsApp"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className={cn("w-full text-base", method === "whatsapp" && "bg-green-600 hover:bg-green-700")}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                {method === "card" ? "Opening secure payment..." : "Placing order..."}
              </>
            ) : (
              submitLabel
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By placing this order you agree to our{" "}
            <Link to="/terms-and-conditions" className="underline underline-offset-2" target="_blank">
              Terms &amp; Conditions
            </Link>
            ,{" "}
            <Link to="/return-policy" className="underline underline-offset-2" target="_blank">
              Return &amp; Refund Policy
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" className="underline underline-offset-2" target="_blank">
              Privacy Policy
            </Link>
            .
          </p>

          <PaymentBadges className="flex flex-col items-center pt-2 [&>p]:justify-center [&>div]:justify-center" />
        </section>
      </form>
    </div>
  );
};

export default Checkout;
