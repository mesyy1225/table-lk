import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EASE_OUT } from "@/components/motion";
import { PHOTOS } from "@/lib/photos";

/*
  Shared pieces for the account screens (log in, register, forgot and reset password, admin
  sign-in). They live here because these pages are the only users; move them to their own
  component file if another screen needs them.
*/

interface AuthShellProps {
  title: string;
  /** One line of help under the title. */
  help?: React.ReactNode;
  /** Secondary links under the form. */
  footer?: React.ReactNode;
  /** Real Table LK photo shown beside the form on desktop only. */
  photo?: { src: string; alt: string; position?: string };
  children: React.ReactNode;
}

/** One calm, centred form on the page ground. No card, no entrance animation. */
export const AuthShell: React.FC<AuthShellProps> = ({ title, help, footer, photo, children }) => {
  const form = (
    <div className="mx-auto w-full max-w-[26rem]">
      <h1 className="text-[2rem] md:text-[2.5rem]">{title}</h1>
      {help && <p className="mt-3 text-steel">{help}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 border-t border-ink/15 pt-6 text-[0.9375rem] text-steel">{footer}</div>}
    </div>
  );

  if (!photo) {
    return (
      <Layout>
        <div className="shell py-12 md:py-20">{form}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="shell grid items-center gap-12 py-12 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-14">
        {form}
        <div className="hidden aspect-[4/3] overflow-hidden rounded-2xl bg-secondary lg:block">
          <img
            src={photo.src}
            alt={photo.alt}
            className="h-full w-full object-cover"
            style={{ objectPosition: photo.position }}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </Layout>
  );
};

/** Inline form error. Slides open when a message appears. */
export const AuthError: React.FC<{ message: string }> = ({ message }) => {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key="error"
          role="alert"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/[0.06] px-4 py-3 text-[0.9375rem] font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Spinner shown in place while the session is being checked. */
export const AuthLoading: React.FC = () => (
  <Layout>
    <div className="shell flex min-h-[50vh] items-center justify-center" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-steel" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  </Layout>
);

type PasswordFieldProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  visible: boolean;
  onToggle: () => void;
};

/** Password input with a 44px show/hide button inside the field. */
export const PasswordField: React.FC<PasswordFieldProps> = ({ visible, onToggle, disabled, className, ...props }) => (
  <div className="relative">
    <Input type={visible ? "text" : "password"} disabled={disabled} className={`pr-12 ${className ?? ""}`} {...props} />
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      className="absolute right-0.5 top-0.5 inline-flex h-11 w-11 items-center justify-center rounded-[0.625rem] text-steel transition-colors duration-300 hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-50"
    >
      {visible ? <EyeOff className="h-[1.125rem] w-[1.125rem]" /> : <Eye className="h-[1.125rem] w-[1.125rem]" />}
    </button>
  </div>
);

export const authLink =
  "font-semibold text-ink underline decoration-teak-deep decoration-[1.5px] underline-offset-4 transition-colors duration-300 hover:text-teak-deep";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, state } = useAuth();
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

    try {
      await login(email, password);
      // Auth state will update via the Supabase subscription
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading screen only during initial auth check
  if (state.isLoading && !state.isAuthenticated) {
    return <AuthLoading />;
  }

  return (
    <AuthShell
      title="Log in"
      help="Log in to see your orders."
      photo={{
        src: PHOTOS.computer,
        alt: "A Table LK computer table with a black top on a white steel frame",
        position: "22% 50%",
      }}
      footer={
        <p>
          New to Table LK?{" "}
          <Link to="/register" className={authLink}>
            Create an account
          </Link>
        </p>
      }
    >
      <AuthError message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
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
            aria-invalid={!!error}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className={`${authLink} -my-3 py-3 text-sm`}>
              Forgot password?
            </Link>
          </div>
          <PasswordField
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            aria-invalid={!!error}
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Logging in
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Login;
