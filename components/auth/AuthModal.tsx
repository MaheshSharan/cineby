import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { AuthBackdrop, AuthMobileBanner } from "@/components/auth/AuthBackdrop";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserRoundIcon,
} from "@/components/ui/icons";
import type { AuthModalProps, AuthMode } from "@/components/auth/types";

export type { AuthMode } from "@/components/auth/types";


export function AuthModal({
  open,
  mode,
  onClose,
  onModeChange,
  onAuthenticated,
  showToast,
}: AuthModalProps) {
  const router = useRouter();
  const [internalMode, setInternalMode] = useState<AuthMode>(mode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  const activeMode = internalMode;

  const handleClose = useCallback(() => {
    onClose(activeMode);
    if (router.pathname === "/login" || router.pathname === "/register") {
      router.push("/", undefined, { shallow: true });
    }
  }, [activeMode, onClose, router]);

  useEffect(() => {
    if (!open) {
      setUsername("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  const handleTabChange = (newMode: AuthMode) => {
    setInternalMode(newMode);
    onModeChange(newMode);
    setError(null);
    if (router.pathname === "/login" || router.pathname === "/register") {
      const newPath = newMode === "login" ? "/login" : "/register";
      if (router.pathname !== newPath) {
        router.push(newPath, undefined, { shallow: true });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = activeMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        activeMode === "login"
          ? { username, password }
          : { username, email, password, displayName: username };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      await onAuthenticated(username, activeMode);

      if (activeMode === "register") {
        showToast("Registered successfully!");
        // Navigate while the full-screen modal still covers the page, then
        // close it — closing first would flash the home page underneath.
        await router.push("/profiles?create=true");
        onClose(activeMode);
      } else {
        showToast(`${username}, welcome back!`);
        handleClose();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeMode === "login" ? "Login" : activeMode === "register" ? "Sign up" : "Reset Password"}
      className="fixed inset-0 z-[200] overflow-hidden bg-[#05070a] text-white animate-in fade-in duration-200"
    >
      {/* Background Dots Pattern */}
      <div className="auth-dots" aria-hidden="true" />

      {/* Top Left Back Button (Exact Movy SVG & Position) */}
      <button
        type="button"
        aria-label="Cancel"
        onClick={handleClose}
        className="absolute left-4 top-5 z-30 text-white/80 transition-colors hover:text-white md:left-8 md:top-11 cursor-pointer"
      >
        <svg
          width="22"
          height="14"
          viewBox="0 0 22 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M7 1.5 1.5 7 7 12.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 7h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
        {/* Mobile Banner Marquee (Top) */}
        <AuthMobileBanner />


        {/* Left Side: Auth Form Area */}
        <div className="relative z-20 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-[400px]">
            {/* Header Titles */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl 2xl:text-3xl">
                {activeMode === "login" ? "Log in to Cineby" : "Create your Cineby account"}
              </h2>
              <p className="mt-1.5 text-[13px] text-white/50">
                {activeMode === "login" ? "Enter your credentials to continue" : "Fill in your details to get started"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col justify-center">
              {/* Username input */}
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                  <UserRoundIcon size={16} />
                </span>
                <input
                  type="text"
                  placeholder={activeMode === "login" ? "Username or Email" : "Username"}
                  minLength={3}
                  maxLength={60}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 md:h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-white/40 transition-colors focus:border-white/[0.14] focus:bg-white/[0.05]"
                />
              </div>

              {/* Email input (register mode) */}
              {activeMode === "register" && (
                <div className="relative mt-3">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <MailIcon size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="Email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 md:h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-white/40 transition-colors focus:border-white/[0.14] focus:bg-white/[0.05]"
                  />
                </div>
              )}

              {/* Password input */}
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                  <LockIcon size={16} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  minLength={8}
                  maxLength={32}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 md:h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-11 text-[13px] text-white outline-none placeholder:text-white/40 transition-colors focus:border-white/[0.14] focus:bg-white/[0.05]"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/30 transition-colors hover:text-white/60 cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                </button>
              </div>


              {/* Error display */}
              {error && (
                <p role="alert" className="text-center text-xs text-primary font-medium mt-2">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-10 md:h-11 w-full rounded-xl bg-white text-[13px] font-semibold text-[#0b0f14] transition-colors hover:bg-white/90 disabled:opacity-50 cursor-pointer"
              >
                <span className="inline-block">
                  {isSubmitting
                    ? "Please wait…"
                    : activeMode === "login"
                    ? "Login"
                    : activeMode === "register"
                    ? "Sign up"
                    : "Sign up"}
                </span>
              </button>

              <p className="mt-2 text-center text-xs text-white/40">Password recovery is available from account settings.</p>

              {/* Mode Switcher */}
              <p className="text-center text-white/50 mt-3 text-[12.5px] md:mt-4 md:text-[13px]">
                {activeMode === "register" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("login")}
                      className="font-semibold text-white transition-colors hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("register")}
                      className="font-semibold text-white transition-colors hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>

              {/* Disclaimer */}
              <p className="text-center text-[11px] text-white/30 mt-6">
                By continuing you agree to our Terms, Privacy and DMCA.
              </p>
            </form>
          </div>
        </div>

        {/* Right Side: Poster Rolling Wall (Desktop) */}
        <AuthBackdrop />
      </div>
    </div>
  );
}

