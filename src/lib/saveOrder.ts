import { supabase } from "@/integrations/supabase/client";

interface OrderInput {
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  notes?: string;
  total: number;
  items: any[];
}

// Saves the order so it appears in the admin dashboard. Never blocks the WhatsApp flow.
export const saveOrder = async (o: OrderInput) => {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    await (supabase as any).from("orders").insert({
      ...o,
      customer_email: user?.email || "",
      user_id: user?.id ?? null,
    });
  } catch (e) {
    console.error("Failed to save order", e);
  }
};
