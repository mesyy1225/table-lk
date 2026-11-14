import { supabase } from "@/integrations/supabase/client";

export type ClientPaymentMethod = "cod" | "whatsapp";

export interface OrderItemInput {
  product_id: string | number;
  name: string;
  price: number;
  quantity: number;
  color?: string;
}

export interface OrderInput {
  order_ref?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  city?: string;
  district?: string;
  notes?: string;
  subtotal?: number;
  delivery_fee?: number;
  total: number;
  items: OrderItemInput[];
  payment_method: ClientPaymentMethod;
}

export interface SaveOrderResult {
  ok: boolean;
  order_ref: string;
  error?: string;
}

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid misreading over the phone

/** Order reference in the shared format TLK-YYMMDD-XXXXX. */
export const generateOrderRef = (date = new Date()): string => {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  let suffix = "";
  const rand = new Uint32Array(5);
  try {
    crypto.getRandomValues(rand);
  } catch {
    for (let i = 0; i < 5; i++) rand[i] = Math.floor(Math.random() * 1e9);
  }
  for (let i = 0; i < 5; i++) suffix += REF_CHARS[rand[i] % REF_CHARS.length];
  return `TLK-${yy}${mm}${dd}-${suffix}`;
};

/**
 * Saves a cash-on-delivery / WhatsApp order so it appears in the admin dashboard.
 * Never throws; the caller decides what to do when `ok` is false.
 * (Anonymous users cannot read orders back, so the ref is generated here.)
 */
export const saveOrder = async (o: OrderInput): Promise<SaveOrderResult> => {
  const order_ref = o.order_ref || generateOrderRef();
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    const base = {
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      customer_email: o.customer_email || user?.email || "",
      shipping_address: o.shipping_address,
      notes: o.notes || null,
      total: o.total,
      items: o.items,
      user_id: user?.id ?? null,
    };

    const { error } = await (supabase as any).from("orders").insert({
      ...base,
      order_ref,
      city: o.city || null,
      district: o.district || null,
      subtotal: o.subtotal ?? o.total,
      delivery_fee: o.delivery_fee ?? 0,
      payment_method: o.payment_method,
      payment_status: "unpaid",
    });

    if (!error) return { ok: true, order_ref };

    // The new order columns may not be deployed yet: fall back to the original columns so
    // the order still reaches the admin dashboard.
    if (error.code === "PGRST204" || /column/i.test(error.message || "")) {
      const address = [o.shipping_address, o.city, o.district].filter(Boolean).join(", ");
      const notes = [`Ref: ${order_ref}`, `Payment: ${o.payment_method.toUpperCase()}`, o.notes]
        .filter(Boolean)
        .join(" | ");
      const { error: legacyError } = await (supabase as any)
        .from("orders")
        .insert({ ...base, shipping_address: address, notes });
      if (!legacyError) return { ok: true, order_ref };
      console.error("Failed to save order", legacyError);
      return { ok: false, order_ref, error: legacyError.message };
    }

    console.error("Failed to save order", error);
    return { ok: false, order_ref, error: error.message || "Could not save the order" };
  } catch (e: any) {
    console.error("Failed to save order", e);
    return { ok: false, order_ref, error: e?.message || "Network error" };
  }
};
