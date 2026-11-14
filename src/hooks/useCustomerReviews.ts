import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerReview {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  review: string;
  images: string[];
  product_id: string | null;
  review_date: string;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

type Filter = { scope: "home" } | { scope: "product"; productId: string } | { scope: "admin" };

const fetchReviews = async (f: Filter): Promise<CustomerReview[]> => {
  let q = (supabase as any)
    .from("customer_reviews")
    .select("*")
    .order("sort_order")
    .order("review_date", { ascending: false });
  if (f.scope !== "admin") q = q.eq("published", true);
  if (f.scope === "home") q = q.eq("featured", true).limit(9);
  if (f.scope === "product") q = q.eq("product_id", f.productId);
  const { data, error } = await q;
  if (error) throw error;
  return ((data || []) as CustomerReview[]).map((r) => ({ ...r, images: r.images ?? [] }));
};

const isUuid = (v?: string) => !!v && /^[0-9a-f-]{36}$/i.test(v);

/** Featured, published reviews for the home page. Empty on error. */
export const useHomeReviews = () =>
  useQuery({ queryKey: ["customer_reviews", "home"], queryFn: () => fetchReviews({ scope: "home" }), staleTime: 60_000, retry: 1 });

/** Published reviews linked to one product (database products only). */
export const useProductReviews = (productId?: string) =>
  useQuery({
    queryKey: ["customer_reviews", "product", productId],
    queryFn: () => fetchReviews({ scope: "product", productId: productId! }),
    enabled: isUuid(productId),
    staleTime: 60_000,
    retry: 1,
  });

/** Admin list: every review. */
export const useAllReviews = () =>
  useQuery({ queryKey: ["customer_reviews", "admin"], queryFn: () => fetchReviews({ scope: "admin" }) });
