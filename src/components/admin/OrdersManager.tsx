import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { PaymentMethodBadge, PaymentStatusBadge } from "@/components/PaymentBadges";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  total: number;
  status: string;
  items: any;
  notes?: string | null;
  created_at: string;
  // Newer columns; tolerate rows / databases without them.
  order_ref?: string | null;
  city?: string | null;
  district?: string | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  paid_at?: string | null;
}

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const money = (n: number) => `Rs. ${Number(n).toLocaleString()}`;

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await (supabase as any).from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const address = [o.shipping_address, o.city, o.district].filter(Boolean).join(", ");
                  const items: any[] = Array.isArray(o.items) ? o.items : [];
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="text-sm align-top">
                        <div className="font-mono font-medium whitespace-nowrap">{o.order_ref || `#${o.id.slice(0, 8)}`}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-muted-foreground max-w-[220px]">{address}</div>
                        {o.notes && <div className="text-xs text-muted-foreground italic max-w-[220px] mt-1">{o.notes}</div>}
                      </TableCell>
                      <TableCell className="text-sm align-top">
                        <div>{o.customer_email}</div>
                        <div>{o.customer_phone}</div>
                      </TableCell>
                      <TableCell className="text-xs align-top min-w-[180px]">
                        {items.map((it, i) => (
                          <div key={i}>
                            {it.name || it.product_name || it.product_id || "Item"}
                            {it.color ? ` (${it.color})` : ""} × {it.quantity || 1}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="align-top whitespace-nowrap">
                        <div className="font-medium">{money(o.total)}</div>
                        {o.subtotal != null && o.delivery_fee != null && (
                          <div className="text-xs text-muted-foreground">
                            {money(o.subtotal)} + {Number(o.delivery_fee) === 0 ? "free delivery" : `${money(o.delivery_fee)} delivery`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col items-start gap-1">
                          <PaymentMethodBadge method={o.payment_method} />
                          <PaymentStatusBadge status={o.payment_status} />
                          {o.paid_at && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(o.paid_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="align-top">
                        <Button size="sm" variant="destructive" onClick={() => remove(o.id)} aria-label="Delete order">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersManager;
