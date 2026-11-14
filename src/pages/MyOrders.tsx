import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentMethodBadge, PaymentStatusBadge } from "@/components/PaymentBadges";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: any[];
  shipping_address: string | null;
  // Newer columns; older rows / databases may not have them.
  order_ref?: string | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
}

const ACTIVE = ["pending", "confirmed", "processing", "shipped"];
const money = (n: number) => `Rs. ${Number(n).toLocaleString()}`;

const OrderCard: React.FC<{ o: Order }> = ({ o }) => {
  const hasBreakdown = o.subtotal != null && o.delivery_fee != null;
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-base break-all">{o.order_ref ? o.order_ref : `Order #${o.id.slice(0, 8)}`}</CardTitle>
          <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PaymentMethodBadge method={o.payment_method} />
          <PaymentStatusBadge status={o.payment_status} />
          <Badge variant={ACTIVE.includes(o.status) ? "default" : "secondary"} className="capitalize">{o.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {(o.items || []).map((it: any, i: number) => (
          <div key={i} className="flex justify-between gap-4 text-sm">
            <span className="min-w-0">
              {it.name || it.product_name || "Item"}
              {it.color ? ` (${it.color})` : ""} × {it.quantity || 1}
            </span>
            {it.price != null && <span className="whitespace-nowrap">{money(it.price * (it.quantity || 1))}</span>}
          </div>
        ))}
        {hasBreakdown && (
          <div className="space-y-1 border-t pt-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(o.subtotal!)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{Number(o.delivery_fee) === 0 ? "Free" : money(o.delivery_fee!)}</span>
            </div>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Total</span>
          <span>{money(o.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const MyOrders: React.FC = () => {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) return;
    (supabase as any)
      .from("orders")
      .select("*")
      .eq("user_id", state.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }: any) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [state.user]);

  if (!state.isLoading && !state.isAuthenticated) return <Navigate to="/login" replace />;

  const current = orders.filter((o) => ACTIVE.includes(o.status));
  const history = orders.filter((o) => !ACTIVE.includes(o.status));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold mb-8">My Orders</h1>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Current orders</h2>
            <div className="space-y-4 mb-10">
              {current.length ? current.map((o) => <OrderCard key={o.id} o={o} />) : <p className="text-muted-foreground text-sm">No active orders.</p>}
            </div>
            <h2 className="text-xl font-semibold mb-4">Purchase history</h2>
            <div className="space-y-4">
              {history.length ? history.map((o) => <OrderCard key={o.id} o={o} />) : <p className="text-muted-foreground text-sm">No past orders yet.</p>}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;
