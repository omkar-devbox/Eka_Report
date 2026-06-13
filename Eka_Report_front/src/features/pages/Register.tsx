import { useState, useId } from "react";
import { useNavigate, Link } from "react-router-dom";
import { m } from "framer-motion";
import { Eye, EyeOff, UserPlus, ShieldCheck, Mail, User } from "lucide-react";

const BASE_URL =
  import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || "http://localhost:8000"
    : "";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const usernameId = useId();
  const emailId = useId();
  const fullNameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
          password: password,
          role: "viewer" // public signup always defaults to viewer
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess("Account registered successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8 relative overflow-hidden">
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
        className="relative w-full max-w-md z-10"
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
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">Create an account</h2>
              <p className="text-sm text-text-secondary mt-1">Get started with your free profile</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">

            {/* Error alert */}
            {error && (
              <m.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-error/10 border border-error/20 text-red-600 rounded-xl px-4 py-3 text-sm"
                role="alert"
              >
                <svg className="w-4.5 h-4.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold">{error}</span>
              </m.div>
            )}

            {/* Success alert */}
            {success && (
              <m.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm"
                role="alert"
              >
                <svg className="w-4.5 h-4.5 mt-0.5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{success}</span>
              </m.div>
            )}

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={fullNameId} className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-text-muted" />
                Full Name
              </label>
              <input
                id={fullNameId}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-bg/60 border border-sidebar-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all font-medium"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={usernameId} className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <span className="font-mono text-text-muted font-bold">@</span>
                Username
              </label>
              <input
                id={usernameId}
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="john.doe"
                className="w-full bg-bg/60 border border-sidebar-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all font-mono"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailId} className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={13} className="text-text-muted" />
                Email Address
              </label>
              <input
                id={emailId}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-bg/60 border border-sidebar-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all font-medium"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={passwordId} className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-text-muted" />
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg/60 border border-sidebar-border rounded-xl px-4 py-2.5 pr-11 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={confirmPasswordId} className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-text-muted" />
                Confirm Password
              </label>
              <input
                id={confirmPasswordId}
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg/60 border border-sidebar-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Account Type / Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-text-muted" />
                Account Type
              </label>
              <input
                type="text"
                disabled
                value="Viewer"
                className="w-full bg-bg/20 border border-sidebar-border/40 rounded-xl px-4 py-2.5 text-sm text-text-muted cursor-not-allowed font-medium select-none"
              />
            </div>

            {/* Submit */}
            <m.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-primary/20 transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account…
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Sign Up
                </>
              )}
            </m.button>
          </form>

          {/* Footer links */}
          <div className="px-8 pb-7 flex flex-col items-center gap-3 text-xs text-text-secondary border-t border-sidebar-border/40 pt-5">
            <div>
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline hover:text-primary-hover font-bold ml-1">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Outer glow ring */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-indigo-500/20 -z-10 blur-sm" />
      </m.div>
    </div>
  );
}
