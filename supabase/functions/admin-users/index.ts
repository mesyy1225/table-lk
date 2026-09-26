import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const { action } = body;

    if (action === "list") {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      const { data: roles } = await admin.from("user_roles").select("user_id, role").eq("role", "admin");
      const { data: profs } = await admin.from("profiles").select("id, full_name");
      const adminSet = new Set((roles || []).map((r) => r.user_id));
      const names = new Map((profs || []).map((p) => [p.id, p.full_name]));
      return json({
        users: data.users.map((x) => ({
          id: x.id,
          email: x.email,
          full_name: names.get(x.id) || "",
          created_at: x.created_at,
          last_sign_in_at: x.last_sign_in_at,
          is_admin: adminSet.has(x.id),
        })),
      });
    }

    if (action === "set_role") {
      const { user_id, role } = body;
      if (user_id === u.user.id && role !== "admin") return json({ error: "You can't remove your own admin role" }, 400);
      if (role === "admin") {
        await admin.from("user_roles").upsert({ user_id, role: "admin" }, { onConflict: "user_id,role" });
      } else {
        await admin.from("user_roles").delete().eq("user_id", user_id).eq("role", "admin");
      }
      return json({ ok: true });
    }

    if (action === "set_password") {
      const { user_id, password } = body;
      if (!password || password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
      const { error } = await admin.auth.admin.updateUserById(user_id, { password });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "send_reset") {
      const { email, redirect_to } = body;
      const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { error } = await anon.auth.resetPasswordForEmail(email, { redirectTo: redirect_to });
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
