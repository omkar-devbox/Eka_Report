import { useState, useId } from "react";
import { useNavigate, Link } from "react-router-dom";
import { m } from "framer-motion";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/shared/lib/store/authStore";

const BASE_URL =
  import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || "http://localhost:8000"
    : "";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState("user01");
  const [password, setPassword] = useState("user01");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameId = useId();
  const passwordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // OAuth2 form-encoded login
      const form = new URLSearchParams();
      form.append("username", username.trim());
      form.append("password", password);

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include", // receive HttpOnly refresh cookie
        body: form.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      setAuth(data.user, data.access_token);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <m.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-sidebar-bg/80 backdrop-blur-2xl border border-sidebar-border rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
          
          {/* Header strip */}
          <div className="px-8 pt-8 pb-6 border-b border-sidebar-border/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary leading-tight">Eka Report Studio</h1>
                <p className="text-xs text-text-secondary">Production Operations Dashboard</p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h2>
              <p className="text-sm text-text-secondary mt-1">Sign in to access your dashboard</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 flex flex-col gap-5">

            {/* Error alert */}
            {error && (
              <m.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-error/10 border border-error/20 text-red-400 rounded-xl px-4 py-3 text-sm"
                role="alert"
              >
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </m.div>
            )}

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={usernameId} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <input
                  id={usernameId}
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.username"
                  className="w-full bg-bg/60 border border-sidebar-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={passwordId} className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg/60 border border-sidebar-border rounded-xl px-4 py-3 pr-11 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <m.button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-primary/20 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </m.button>

            <div className="text-center mt-2">
              <span className="text-xs text-text-secondary">Don't have an account? </span>
              <Link
                to="/register"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                Register here
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 pb-7 flex items-center justify-center gap-2 text-xs text-text-secondary">
            <ShieldCheck size={13} className="text-primary/70" />
            <span>Secured with JWT + HttpOnly refresh token</span>
          </div>
        </div>

        {/* Outer glow ring */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-indigo-500/20 -z-10 blur-sm" />
      </m.div>
    </div>
  );
}
