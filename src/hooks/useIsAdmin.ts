import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useIsAdmin = () => {
  const { state } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (!state.isAuthenticated || !state.user) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", state.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) {
        setIsAdmin(!error && !!data);
        setLoading(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [state.isAuthenticated, state.user]);

  return { isAdmin, loading };
};
