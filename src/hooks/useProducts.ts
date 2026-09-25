import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/data";

const mapRow = (r: any): Product => {
  const images: string[] = (r.images && r.images.length ? r.images : [r.image_url]).filter(Boolean);
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    shortDescription: r.short_description ?? "",
    price: Number(r.price) || 0,
    images: images.length ? images : ["/placeholder.svg"],
    categories: r.categories?.length ? r.categories : r.category ? [r.category] : [],
    material: r.material ?? "",
    dimensions: {
      width: Number(r.dimensions?.width) || 0,
      length: Number(r.dimensions?.length) || 0,
      height: Number(r.dimensions?.height) || 0,
    },
    inStock: (r.stock ?? 0) > 0,
    featured: !!r.featured,
    rating: 5,
    reviews: [],
    colors: r.colors ?? [],
  };
};

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      const list = (data || []).map(mapRow);
      if (typeof window !== "undefined") window.products = list;
      return list as Product[];
    },
    staleTime: 60_000,
  });

export const useProduct = (id?: string) => {
  const q = useProducts();
  return { ...q, product: q.data?.find((p) => String(p.id) === String(id)) };
};
