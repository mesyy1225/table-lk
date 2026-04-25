import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";

// Map admin username to a stable email used in Supabase Auth
const usernameToEmail = (username: string) => {
  const u = username.trim().toLowerCase();
  if (u === "kalanabimsara") return "kalanabimsara@tablelk.com";
  return `${u}@tablelk.com`;
};

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { state } = useAuth();
  const { isAdmin, loading } = useIsAdmin();

  useEffect(() => {
    if (state.isAuthenticated && !loading && isAdmin) navigate("/admin");
  }, [state.isAuthenticated, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const email = usernameToEmail(username);
    try {
      // Try sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        // First-time bootstrap: if super admin account doesn't exist yet, create it.
        if (
          email === "kalanabimsara@tablelk.com" &&
          (signInError.message?.toLowerCase().includes("invalid") ||
            signInError.message?.toLowerCase().includes("credentials"))
        ) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/admin`,
              data: { full_name: "KalanaBimsara" },
            },
          });
          if (signUpError) throw signUpError;
          // Try sign-in again (works when email confirmation is disabled)
          const { error: retryErr } = await supabase.auth.signInWithPassword({ email, password });
          if (retryErr) {
            toast.success("Admin account created. Please confirm the email if required, then sign in.");
            return;
          }
        } else {
          throw signInError;
        }
      }
      toast.success("Welcome, admin");
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Restricted access. Authorized personnel only.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={submitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLogin;
