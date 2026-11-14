import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError, AuthShell, PasswordField, authLink } from "./Login";

const ResetPassword: React.FC = () => {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pw.length < 6) return setError("Password must be at least 6 characters");
    if (pw !== pw2) return setError("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setError(`${error.message}. Try requesting a new reset link.`);
    toast.success("Password updated");
    navigate("/");
  };

  return (
    <AuthShell
      title="Set a new password"
      help="Use at least 6 characters."
      footer={
        <p>
          Link not working?{" "}
          <Link to="/forgot-password" className={authLink}>
            Request a new reset link
          </Link>
        </p>
      }
    >
      <AuthError message={error} />
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pw">New password</Label>
          <PasswordField
            id="pw"
            autoComplete="new-password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={busy}
            visible={show}
            onToggle={() => setShow(!show)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw2">Confirm password</Label>
          <PasswordField
            id="pw2"
            autoComplete="new-password"
            required
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            disabled={busy}
            visible={show}
            onToggle={() => setShow(!show)}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" /> Saving
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
