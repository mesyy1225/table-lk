import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeroSlide {
  id: string;
  image_url: string;
  alt: string;
  object_position: string;
  sort_order: number;
  active: boolean;
}

// Shown when the database has no active slides or can't be reached.
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    image_url: "https://u.cubeupload.com/Tablelkk/IMG20250409WA0003.jpg",
    alt: "TableLK L-shaped office table with ash-white top and black steel frame",
    object_position: "70% 60%",
    sort_order: 0,
    active: true,
  },
  {
    id: "default-2",
    image_url: "https://u.cubeupload.com/Tablelkk/IMG20250330WA0004.jpg",
    alt: "TableLK teak-finish dining table on a black steel frame",
    object_position: "60% 50%",
    sort_order: 1,
    active: true,
  },
  {
    id: "default-3",
    image_url: "https://u.cubeupload.com/Tablelkk/WhatsAppImage2025031.jpg",
    alt: "TableLK smart computer table with black top and white steel frame",
    object_position: "70% 55%",
    sort_order: 2,
    active: true,
  },
  {
    id: "default-4",
    image_url: "https://u.cubeupload.com/Tablelkk/IMG20250120WA0011.jpg",
    alt: "TableLK modern L-shaped workstation with teak top and white frame",
    object_position: "65% 55%",
    sort_order: 3,
    active: true,
  },
];

const fetchSlides = async (includeInactive: boolean): Promise<HeroSlide[]> => {
  let q = (supabase as any).from("hero_slides").select("*").order("sort_order").order("created_at");
  if (!includeInactive) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as HeroSlide[];
};

/** Public carousel: active slides, falling back to the built-in photos. */
export const useHeroSlides = () => {
  const q = useQuery({
    queryKey: ["hero_slides", "public"],
    queryFn: () => fetchSlides(false),
    staleTime: 60_000,
    retry: 1,
  });
  const slides = q.data && q.data.length ? q.data : DEFAULT_HERO_SLIDES;
  return { ...q, slides };
};

/** Admin list: every slide, including hidden ones. */
export const useAllHeroSlides = () =>
  useQuery({ queryKey: ["hero_slides", "all"], queryFn: () => fetchSlides(true) });
