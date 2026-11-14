import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PHOTOS } from "@/lib/photos";
import { AuthError, AuthLoading, AuthShell, PasswordField, authLink } from "./Login";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, state } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      navigate("/");
    }
  }, [state.isAuthenticated, state.isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      await register(name, email, password);
      // Auth state will update via the Supabase subscription
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading screen only during initial auth check
  if (state.isLoading && !state.isAuthenticated) {
    return <AuthLoading />;
  }

  const mismatch = error === "Passwords do not match";

  return (
    <AuthShell
      title="Create an account"
      help="An account keeps your Table LK orders in one place."
      photo={{
        src: PHOTOS.dining,
        alt: "A Table LK dining table with a teak-finish top on a black steel frame",
      }}
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className={authLink}>
            Log in
          </Link>
        </p>
      }
    >
      <AuthError message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordField
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
            aria-invalid={mismatch}
            className={mismatch ? "border-destructive focus-visible:ring-destructive" : undefined}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Register;
