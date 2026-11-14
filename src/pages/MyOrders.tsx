import SEOHead from "@/components/SEOHead";
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentMethodBadge, PaymentStatusBadge } from "@/components/PaymentBadges";
import { formatPrice } from "@/lib/format";

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

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, ${date
    .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase()}`;
};

const OrderCard: React.FC<{ o: Order }> = ({ o }) => {
  const hasBreakdown = o.subtotal != null && o.delivery_fee != null;
  return (
    <li className="rounded-2xl border border-ink/10 bg-card p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h3 className="num break-all font-sans text-lg font-semibold tracking-normal">
            {o.order_ref ? o.order_ref : `Order #${o.id.slice(0, 8)}`}
          </h3>
          <p className="num mt-1 text-sm text-steel">
            <time dateTime={o.created_at}>{formatDate(o.created_at)}</time>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <OrderStatusBadge status={o.status} />
          <PaymentStatusBadge status={o.payment_status} />
          <PaymentMethodBadge method={o.payment_method} />
        </div>
      </div>

      <ul className="mt-5 divide-y divide-ink/10 border-t border-ink/10">
        {(o.items || []).map((it: any, i: number) => (
          <li key={i} className="flex items-baseline justify-between gap-4 py-3 text-[0.9375rem]">
            <span className="min-w-0">
              <span className="font-medium">{it.name || it.product_name || "Item"}</span>
              <span className="text-steel">
                {it.color ? ` · ${it.color}` : ""} <span className="num">× {it.quantity || 1}</span>
              </span>
            </span>
            {it.price != null && <span className="num whitespace-nowrap">{formatPrice(it.price * (it.quantity || 1))}</span>}
          </li>
        ))}
      </ul>

      <dl className="space-y-2 border-t border-ink/10 pt-4 text-[0.9375rem]">
        {hasBreakdown && (
          <>
            <div className="flex justify-between gap-4 text-steel">
              <dt>Subtotal</dt>
              <dd className="num">{formatPrice(Number(o.subtotal))}</dd>
            </div>
            <div className="flex justify-between gap-4 text-steel">
              <dt>Delivery</dt>
              <dd className="num">{Number(o.delivery_fee) === 0 ? "Free" : formatPrice(Number(o.delivery_fee))}</dd>
            </div>
          </>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-semibold">Total</dt>
          <dd className="num font-display text-xl font-bold tracking-[-0.02em]">{formatPrice(Number(o.total))}</dd>
        </div>
      </dl>
    </li>
  );
};

const bar = "rounded bg-ink/10";

const OrderSkeleton: React.FC = () => (
  <li className="animate-pulse rounded-2xl border border-ink/10 bg-card p-5 md:p-7" aria-hidden="true">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2.5">
        <div className={`${bar} h-5 w-44`} />
        <div className={`${bar} h-3.5 w-32`} />
      </div>
      <div className="flex gap-1.5">
        <div className={`${bar} h-6 w-20 rounded-full`} />
        <div className={`${bar} h-6 w-16 rounded-full`} />
      </div>
    </div>
    <div className="mt-5 space-y-4 border-t border-ink/10 pt-4">
      <div className="flex justify-between gap-4">
        <div className={`${bar} h-4 w-1/2`} />
        <div className={`${bar} h-4 w-20`} />
      </div>
      <div className="flex justify-between gap-4 border-t border-ink/10 pt-4">
        <div className={`${bar} h-5 w-14`} />
        <div className={`${bar} h-5 w-24`} />
      </div>
    </div>
  </li>
);

const Group: React.FC<{ title: string; orders: Order[]; empty: string }> = ({ title, orders, empty }) => (
  <section className="mt-12 first:mt-0 md:mt-16">
    <h2 className="flex items-baseline gap-3 text-xl md:text-2xl">
      {title}
      {orders.length > 0 && <span className="num font-sans text-base font-normal tracking-normal text-steel">{orders.length}</span>}
    </h2>
    {orders.length ? (
      <ul className="mt-5 space-y-4">
        {orders.map((o) => (
          <OrderCard key={o.id} o={o} />
        ))}
      </ul>
    ) : (
      <p className="mt-4 border-t border-ink/10 pt-4 text-steel">{empty}</p>
    )}
  </section>
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
      <SEOHead title="My orders | TableLK" noindex />
      <div className="shell pt-8 md:pt-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="display-lg">My orders</h1>

          <div className="mt-8 md:mt-12">
            {loading ? (
              <div role="status" aria-label="Loading your orders">
                <ul className="space-y-4">
                  <OrderSkeleton />
                  <OrderSkeleton />
                  <OrderSkeleton />
                </ul>
              </div>
            ) : orders.length === 0 ? (
              <div className="border-t border-ink/15 pt-10 md:pt-14">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teak-tint text-teak-deep">
                  <PackageOpen className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h2 className="display-md mt-6">No orders yet</h2>
                <p className="mt-3 max-w-[46ch] text-steel md:text-lg">
                  When you order a table, it shows up here with its payment and delivery status.
                </p>
                <Button asChild size="lg" className="mt-8">
                  <Link to="/shop">
                    Browse tables
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Group title="Current orders" orders={current} empty="No active orders." />
                <Group title="Purchase history" orders={history} empty="No past orders yet." />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyOrders;
