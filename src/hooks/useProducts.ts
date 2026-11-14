import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, products as staticProducts } from "@/lib/data";

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

// Static catalogue from src/lib/data.ts, used when the database is unreachable or empty
// so the shop is never blank. Fallback ids are numbers (1..6), database ids are uuids.
const fallbackProducts = (): Product[] =>
  staticProducts.map((p) => ({ ...p, images: [...p.images], categories: [...p.categories] }));

/** True when the product list currently comes from the static fallback, not the database. */
export let isFallback = false;

const fetchProducts = async (): Promise<Product[]> => {
  let list: Product[] = [];
  try {
    const { data, error } = await (supabase as any)
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    list = (data || []).map(mapRow);
  } catch (e) {
    console.warn("Products could not be loaded from the database; using the built-in catalogue.", e);
  }
  isFallback = list.length === 0;
  if (isFallback) list = fallbackProducts();
  if (typeof window !== "undefined") window.products = list;
  return list;
};

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });

export const useProduct = (id?: string) => {
  const q = useProducts();
  return { ...q, product: q.data?.find((p) => String(p.id) === String(id)) };
};
