// PayHere server-to-server payment notification (notify_url).
// Deploy with: supabase functions deploy payhere-notify --no-verify-jwt
import { createClient } from "npm:@supabase/supabase-js@2";
import { crypto } from "jsr:@std/crypto@1";
import { encodeHex } from "jsr:@std/encoding@1/hex";

const md5Upper = async (s: string) =>
  encodeHex(await crypto.subtle.digest("MD5", new TextEncoder().encode(s))).toUpperCase();

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain" } });

// PayHere status_code -> orders.payment_status
const STATUS_MAP: Record<string, string> = {
  "2": "paid",
  "0": "pending",
  "-1": "cancelled",
  "-2": "failed",
  "-3": "chargedback",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return text("Method not allowed", 405);

  try {
    const merchantId = Deno.env.get("PAYHERE_MERCHANT_ID")?.trim();
    const merchantSecret = Deno.env.get("PAYHERE_MERCHANT_SECRET")?.trim();
    if (!merchantId || !merchantSecret) {
      console.log("payhere-notify: merchant credentials not configured");
      return text("Not configured", 503);
    }

    const form = new URLSearchParams(await req.text());
    const f = (k: string) => (form.get(k) ?? "").trim();
    const merchant_id = f("merchant_id");
    const order_id = f("order_id");
    const payment_id = f("payment_id");
    const payhere_amount = f("payhere_amount");
    const payhere_currency = f("payhere_currency");
    const status_code = f("status_code");
    const md5sig = f("md5sig").toUpperCase();

    const expected = await md5Upper(
      merchant_id + order_id + payhere_amount + payhere_currency + status_code + (await md5Upper(merchantSecret)),
    );
    if (!md5sig || md5sig !== expected || merchant_id !== merchantId) {
      console.log(`payhere-notify: bad signature for order ${order_id || "?"}`);
      return text("Invalid signature", 400);
    }

    // Verified from here on: always answer 200 so PayHere stops retrying.
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error } = await admin
      .from("orders")
      .select("id, order_ref, total, status, payment_status, payment_method")
      .eq("order_ref", order_id)
      .maybeSingle();
    if (error) throw error;
    if (!order) {
      console.log(`payhere-notify: unknown order ${order_id}`);
      return text("OK");
    }

    const newStatus = STATUS_MAP[status_code];
    if (!newStatus) {
      console.log(`payhere-notify: ${order_id} unknown status_code ${status_code}`);
      return text("OK");
    }

    const amountOk =
      Math.round(Number(payhere_amount) * 100) === Math.round(Number(order.total) * 100) &&
      Number.isFinite(Number(payhere_amount));
    if (payhere_currency !== "LKR" || !amountOk) {
      console.log(
        `payhere-notify: ${order_id} amount/currency mismatch (got ${payhere_amount} ${payhere_currency}, expected ${Number(order.total).toFixed(2)} LKR)`,
      );
      return text("OK");
    }

    if (order.payment_status === "paid" && newStatus !== "chargedback") {
      console.log(`payhere-notify: ${order_id} already paid, ignoring status ${newStatus}`);
      return text("OK");
    }

    const update: Record<string, unknown> = { payment_status: newStatus };
    if (payment_id) update.payhere_payment_id = payment_id;
    if (newStatus === "paid") {
      update.paid_at = new Date().toISOString();
      if (order.status === "pending") update.status = "confirmed";
    }

    const { error: uErr } = await admin.from("orders").update(update).eq("id", order.id);
    if (uErr) throw uErr;

    console.log(`payhere-notify: ${order_id} -> ${newStatus}`);
    return text("OK");
  } catch (e) {
    console.error("payhere-notify error:", (e as any)?.message ?? e);
    return text("Error", 500);
  }
});
