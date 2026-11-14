import { supabase } from "@/integrations/supabase/client";

/** PayHere payment object, built and signed by the `payhere-checkout` edge function. */
export interface PayHerePayment {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  [key: string]: unknown;
}

interface PayHereSDK {
  onCompleted: (orderId: string) => void;
  onDismissed: () => void;
  onError: (error: string) => void;
  startPayment: (payment: PayHerePayment) => void;
}

declare global {
  interface Window {
    payhere?: PayHereSDK;
  }
}

const SDK_URL = "https://www.payhere.lk/lib/payhere.js";
let sdkPromise: Promise<PayHereSDK> | null = null;

/** Inject the PayHere SDK once and resolve when `window.payhere` is ready. */
export const loadPayHere = (): Promise<PayHereSDK> => {
  if (window.payhere) return Promise.resolve(window.payhere);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<PayHereSDK>((resolve, reject) => {
    const fail = () => {
      sdkPromise = null;
      reject(new Error("Could not load the secure payment window. Check your connection and try again."));
    };
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    const done = () => (window.payhere ? resolve(window.payhere) : fail());
    if (!script) {
      script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => {
      script?.remove();
      fail();
    }, { once: true });
  });
  return sdkPromise;
};

export interface CheckoutItemInput {
  product_id: string;
  quantity: number;
  color?: string;
}

export interface CheckoutCustomer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

export interface CardCheckoutResponse {
  order_ref: string;
  total: number;
  delivery_fee: number;
  payment: PayHerePayment;
}

/** Create a pending card order on the server and get the signed PayHere payment. Throws with a readable message. */
export const createCardCheckout = async (body: {
  items: CheckoutItemInput[];
  customer: CheckoutCustomer;
  notes?: string;
}): Promise<CardCheckoutResponse> => {
  const { data, error } = await supabase.functions.invoke("payhere-checkout", { body });
  if (error) {
    let message = "";
    const ctx = (error as any)?.context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const json = await ctx.json();
        message = json?.error || json?.message || "";
      } catch {
        /* body was not JSON */
      }
    }
    throw new Error(message || "Card payments are unavailable right now.");
  }
  if (!data || (data as any).error) {
    throw new Error((data as any)?.error || "Card payments are unavailable right now.");
  }
  if (!data.payment || !data.order_ref) throw new Error("Unexpected response from the payment server.");
  return data as CardCheckoutResponse;
};

/** Open the PayHere popup. Handlers are attached fresh for each payment. */
export const startPayHerePayment = async (
  payment: PayHerePayment,
  handlers: { onCompleted: (orderId: string) => void; onDismissed: () => void; onError: (error: string) => void }
) => {
  const payhere = await loadPayHere();
  payhere.onCompleted = handlers.onCompleted;
  payhere.onDismissed = handlers.onDismissed;
  payhere.onError = handlers.onError;
  payhere.startPayment(payment);
};
