import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteContent = () => {
  const q = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("site_content").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => {
        if (r.value?.text) map[r.key] = r.value.text;
      });
      return map;
    },
    staleTime: 60_000,
  });
  const get = (key: string, fallback: string) => q.data?.[key] || fallback;
  return { get, ...q };
};
