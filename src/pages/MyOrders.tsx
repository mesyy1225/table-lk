import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: any[];
  shipping_address: string | null;
}

const ACTIVE = ["pending", "confirmed", "processing", "shipped"];

const OrderCard: React.FC<{ o: Order }> = ({ o }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <CardTitle className="text-base">Order #{o.id.slice(0, 8)}</CardTitle>
        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
      </div>
      <Badge variant={ACTIVE.includes(o.status) ? "default" : "secondary"} className="capitalize">{o.status}</Badge>
    </CardHeader>
    <CardContent className="space-y-2">
      {(o.items || []).map((it: any, i: number) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{it.name || it.product_name || "Item"} × {it.quantity || 1}</span>
          {it.price != null && <span>Rs. {Number(it.price * (it.quantity || 1)).toLocaleString()}</span>}
        </div>
      ))}
      <div className="flex justify-between font-semibold border-t pt-2">
        <span>Total</span>
        <span>Rs. {Number(o.total).toLocaleString()}</span>
      </div>
    </CardContent>
  </Card>
);

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
