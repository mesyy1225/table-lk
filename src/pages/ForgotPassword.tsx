import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthShell, authLink } from "./Login";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <AuthShell
      title="Forgot password"
      help={sent ? undefined : "Enter your email and we'll send you a link to reset your password."}
      footer={
        <Link to="/login" className={authLink}>
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <p role="status" className="text-lg text-ink">
          If an account exists for <span className="break-all font-semibold">{email}</span>, a reset link has been sent.
          Check your inbox.
        </p>
      ) : (
        <>
          <AuthError message={error} />
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                aria-invalid={!!error}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" /> Sending
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
