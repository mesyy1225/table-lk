// Creates a card order and returns a signed PayHere payment object.
// Deploy with: supabase functions deploy payhere-checkout --no-verify-jwt
import { createClient } from "npm:@supabase/supabase-js@2";
import { crypto } from "jsr:@std/crypto@1";
import { encodeHex } from "jsr:@std/encoding@1/hex";

// Delivery charge in LKR per order. KEEP IN SYNC with src/lib/policyConfig.ts
// (policyConfig.deliveryFee and WESTERN_DISTRICTS).
const DELIVERY_FEE = { western: 0, other: 0 };
const WESTERN_DISTRICTS = ["Colombo", "Gampaha", "Kalutara"];
const deliveryFeeFor = (district: string) =>
  WESTERN_DISTRICTS.includes(district) ? DELIVERY_FEE.western : DELIVERY_FEE.other;

const CURRENCY = "LKR";
const MAX_ITEMS = 20;
const MAX_QTY = 20;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

class BadRequest extends Error {}

const md5Upper = async (s: string) =>
  encodeHex(await crypto.subtle.digest("MD5", new TextEncoder().encode(s))).toUpperCase();

const str = (v: unknown, field: string, max: number, required = true): string => {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) throw new BadRequest(`Please enter your ${field}.`);
  if (s.length > max) throw new BadRequest(`Your ${field} is too long.`);
  return s;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;

interface InItem {
  product_id: string;
  quantity: number;
  color?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const merchantId = Deno.env.get("PAYHERE_MERCHANT_ID")?.trim();
    const merchantSecret = Deno.env.get("PAYHERE_MERCHANT_SECRET")?.trim();
    if (!merchantId || !merchantSecret) {
      return json({ error: "Card payments are not configured yet" }, 503);
    }
    const sandbox = Deno.env.get("PAYHERE_SANDBOX") !== "false";
    const siteUrl = (Deno.env.get("SITE_URL") || "https://www.tablelk.com").replace(/\/+$/, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let body: any;
    try {
      body = await req.json();
    } catch {
      throw new BadRequest("Invalid request body.");
    }

    // ---- Validate items
    const rawItems = body?.items;
    if (!Array.isArray(rawItems) || rawItems.length < 1) throw new BadRequest("Your cart is empty.");
    if (rawItems.length > MAX_ITEMS) throw new BadRequest(`You can order at most ${MAX_ITEMS} items at once.`);
    const items: InItem[] = rawItems.map((it: any) => {
      const product_id = typeof it?.product_id === "string" || typeof it?.product_id === "number"
        ? String(it.product_id).trim()
        : "";
      if (!product_id) throw new BadRequest("A cart item is missing its product.");
      const quantity = Number(it?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
        throw new BadRequest(`Quantity must be a whole number between 1 and ${MAX_QTY}.`);
      }
      const color = typeof it?.color === "string" && it.color.trim() ? it.color.trim().slice(0, 50) : undefined;
      return { product_id, quantity, color };
    });

    // ---- Validate customer
    const c = body?.customer ?? {};
    const first_name = str(c.first_name, "first name", 100);
    const last_name = str(c.last_name, "last name", 100);
    const email = str(c.email, "email address", 320);
    if (!EMAIL_RE.test(email)) throw new BadRequest("Please enter a valid email address.");
    const phone = str(c.phone, "phone number", 20);
    if (!PHONE_RE.test(phone)) throw new BadRequest("Please enter a valid phone number.");
    const address = str(c.address, "address", 500);
    const city = str(c.city, "city", 100);
    const district = str(c.district, "district", 100);
    const notes = str(body?.notes, "notes", 2000, false) || null;

    // ---- Load products (prices always come from the database)
    const ids = [...new Set(items.map((i) => i.product_id))];
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (ids.some((id) => !UUID_RE.test(id))) {
      throw new BadRequest("Some items in your cart are no longer available. Please refresh and try again.");
    }
    const { data: rows, error: pErr } = await admin
      .from("products")
      .select("id, name, price, stock, colors")
      .in("id", ids);
    if (pErr) throw pErr;
    const byId = new Map((rows ?? []).map((r: any) => [String(r.id), r]));

    let subtotalCents = 0;
    const orderItems = items.map((it) => {
      const p: any = byId.get(it.product_id);
      if (!p) throw new BadRequest("Some items in your cart are no longer available. Please refresh and try again.");
      if ((p.stock ?? 0) <= 0) throw new BadRequest(`${p.name} is out of stock.`);
      if (it.color && Array.isArray(p.colors) && p.colors.length && !p.colors.includes(it.color)) {
        throw new BadRequest(`${it.color} is not available for ${p.name}.`);
      }
      const priceCents = Math.round(Number(p.price) * 100);
      subtotalCents += priceCents * it.quantity;
      return {
        product_id: it.product_id,
        name: p.name as string,
        price: priceCents / 100,
        quantity: it.quantity,
        color: it.color ?? null,
      };
    });

    const deliveryCents = Math.round(deliveryFeeFor(district) * 100);
    const totalCents = subtotalCents + deliveryCents;
    if (totalCents <= 0) throw new BadRequest("Order total must be greater than zero.");
    const subtotal = subtotalCents / 100;
    const delivery_fee = deliveryCents / 100;
    const total = totalCents / 100;

    // ---- Optional signed-in user (guests are fine)
    let user_id: string | null = null;
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (token && token.split(".").length === 3) {
      try {
        const { data } = await admin.auth.getUser(token);
        user_id = data?.user?.id ?? null;
      } catch {
        user_id = null;
      }
    }

    // ---- Create the order
    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        user_id,
        customer_name: `${first_name} ${last_name}`,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address,
        city,
        district,
        items: orderItems,
        subtotal,
        delivery_fee,
        total,
        notes,
        payment_method: "card",
        payment_status: "pending",
        status: "pending",
      })
      .select("order_ref")
      .single();
    if (oErr) throw oErr;
    const order_ref = order.order_ref as string;

    // ---- Build the signed PayHere payment object
    const amount = total.toFixed(2);
    const hash = await md5Upper(merchantId + order_ref + amount + CURRENCY + (await md5Upper(merchantSecret)));
    const itemsLabel = orderItems
      .map((i) => `${i.name}${i.color ? ` (${i.color})` : ""} x${i.quantity}`)
      .join(", ");

    const payment = {
      sandbox,
      merchant_id: merchantId,
      return_url: `${siteUrl}/payment/success?order=${encodeURIComponent(order_ref)}`,
      cancel_url: `${siteUrl}/payment/cancel?order=${encodeURIComponent(order_ref)}`,
      notify_url: `${supabaseUrl}/functions/v1/payhere-notify`,
      order_id: order_ref,
      items: itemsLabel.length > 250 ? itemsLabel.slice(0, 247) + "..." : itemsLabel,
      amount,
      currency: CURRENCY,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country: "Sri Lanka",
      hash,
    };

    console.log(`payhere-checkout: created ${order_ref} total ${amount} ${CURRENCY} sandbox=${sandbox}`);
    return json({ order_ref, total, delivery_fee, payment });
  } catch (e) {
    if (e instanceof BadRequest) return json({ error: e.message }, 400);
    console.error("payhere-checkout error:", (e as any)?.message ?? e);
    return json({ error: "Something went wrong while starting your payment. Please try again." }, 500);
  }
});
