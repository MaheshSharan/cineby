import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserRoundIcon,
} from "@/components/ui/icons";

export type AuthMode = "login" | "register" | "forgot";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onClose: (mode: AuthMode) => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (username: string, mode: AuthMode) => Promise<void>;
  showToast: (msg: string) => void;
}

const POSTERS_COL_1 = [
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F6UqflU8Qqkz7Dq4swJPqs0ZJjY4.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FbjiS5ipwxb9JFy3XRRN4OAilSeX.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FsfQtVlIHljToOwYjhe21KPGzZWK.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FrhGx6E3qRNMgj3i5su2oukNHwIQ.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2ForkLtdgMGiO9rTVMqJ1kKwrnup1.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F360qdtu2hLnqMu8SVHMywn420w1.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FfYXqpgPmHMphSF2W30GbTeJVIa5.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F2DPmTlv8F0V1TQBPmlsGOVOhtWk.jpg&output=webp&q=50",
];

const POSTERS_COL_2 = [
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FaAnTt6KpmbbHbd6xH3FQFlppZjc.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F5O616X9vmRzQdB68PHzBewPittd.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F4tTrW9dXCByS5wt2pXVWb58zNjz.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FxTZuh9ziUjIyHBWO9OvqNIPqVWe.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2Falpf5v4UqSFawPmG9RX03Or4BDk.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FuRxrNXQWkHoENm3nwVOZDYSCx2F.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2Fb7Dr8Chzse8VagexAporUu2RtLx.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2Ff1VCQIG2iCyOookdgOzwtUpwWC0.jpg&output=webp&q=50",
];

const POSTERS_COL_3 = [
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F5rhTDKUhPYvpdQIijFIs5VoWsON.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F3PWJqDfygN0YNNjWsDUOXclCp3h.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FbRwnj8WEKBCvmfeUNOukJPwB43K.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FdIl3cGBcR9AwOjWhEbMuagXdVtG.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2Fdx2dblJL3GAKcXXXPjC2FSaMTWW.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F4LwvU9SZc8QQzW1X1FAPhNbXnEU.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FgpC7h43xPMEV3goYMQShfJbTtLq.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F2EewmxXe72ogD0EaWM8gqa0ccIw.jpg&output=webp&q=50",
];

const POSTERS_COL_4 = [
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FovDgO2LPfwdVRfvScAqo9aMiIW.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FdB4EDhre2dsC2kxYDavyKWqLQwi.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FoHqYrPAsIiTD5m4DuxumV4er8BU.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2Ftxj8ujTZwGUjpCdhCsQBnTlh4aS.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FrzpHPSEgPTpRs8EHbygwsOw7jC0.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2FxsrkiXg8EuNNtbPtbmvCxg95gK7.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F97TTJuqiSMfU0DuXx1B4NG5QNP7.jpg&output=webp&q=50",
  "https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Fw342%2F2mwgHfOyrFrmvozjFoEXHRdfGhv.jpg&output=webp&q=50",
];

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
  const [confirmPassword, setConfirmPassword] = useState("");
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
      setConfirmPassword("");
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
      const newPath = newMode === "login" ? "/login" : newMode === "register" ? "/register" : "/login";
      if (router.pathname !== newPath) {
        router.push(newPath, undefined, { shallow: true });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (activeMode === "forgot") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }

      if (password.length < 8) {
        setError("New password must be at least 8 characters.");
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, newPassword: password }),
        });

        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? "Failed to reset password.");
          return;
        }

        await onAuthenticated(username, activeMode);
        showToast("Password reset successfully!");
        handleClose();
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const endpoint = activeMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        activeMode === "login"
          ? { username, password }
          : { username, email: email || `${username}@cineby.app`, password, displayName: username };

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
        onClose(activeMode);
        router.push("/profiles?create=true");
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
        <div
          className="block lg:hidden h-[180px] md:h-[220px] overflow-hidden relative pointer-events-none shrink-0"
          style={{
            maskImage:
              "linear-gradient(black 0%, black 42%, rgba(0,0,0,0.35) 72%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(black 0%, black 42%, rgba(0,0,0,0.35) 72%, transparent 100%)",
          }}
        >
          <div className="poster-wall">
            <div className="poster-row">
              <div className="poster-track">
                <div className="poster-rail" style={{ ["--duration" as string]: "30s" }}>
                  {POSTERS_COL_1.map((src, i) => (
                    <figure key={i} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div className="poster-rail" aria-hidden="true" style={{ ["--duration" as string]: "30s" }}>
                  {POSTERS_COL_1.map((src, i) => (
                    <figure key={`dup-${i}`} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>

              <div className="poster-track">
                <div className="poster-rail poster-reverse" style={{ ["--duration" as string]: "35s" }}>
                  {POSTERS_COL_2.map((src, i) => (
                    <figure key={i} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div
                  className="poster-rail poster-reverse"
                  aria-hidden="true"
                  style={{ ["--duration" as string]: "35s" }}
                >
                  {POSTERS_COL_2.map((src, i) => (
                    <figure key={`dup-${i}`} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>

              <div className="poster-track">
                <div className="poster-rail" style={{ ["--duration" as string]: "40s" }}>
                  {POSTERS_COL_3.map((src, i) => (
                    <figure key={i} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div className="poster-rail" aria-hidden="true" style={{ ["--duration" as string]: "40s" }}>
                  {POSTERS_COL_3.map((src, i) => (
                    <figure key={`dup-${i}`} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side: Auth Form Area */}
        <div className="relative z-20 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-[400px]">
            {/* Header Titles */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl 2xl:text-3xl">
                {activeMode === "login"
                  ? "Log in to Cineby"
                  : activeMode === "register"
                  ? "Create your Cineby account"
                  : "Reset your password"}
              </h2>
              <p className="mt-1.5 text-[13px] text-white/50">
                {activeMode === "login"
                  ? "Enter your credentials to continue"
                  : activeMode === "register"
                  ? "Fill in your details to get started"
                  : "Enter your username to set a new password"}
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
                  placeholder={activeMode === "forgot" ? "New Password (min 8 chars)" : "Password"}
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

              {/* Confirm Password (forgot mode) */}
              {activeMode === "forgot" && (
                <div className="relative mt-3">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <LockIcon size={16} />
                  </span>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    minLength={8}
                    maxLength={32}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 md:h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-white/40 transition-colors focus:border-white/[0.14] focus:bg-white/[0.05]"
                  />
                </div>
              )}

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
                    : "Reset Password"}
                </span>
              </button>

              {/* Forgot password link */}
              {activeMode === "login" && (
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => handleTabChange("forgot")}
                    className="text-xs text-white/40 transition-colors hover:text-white/70 cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

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
        <div className="hidden lg:flex relative h-full w-[44%] xl:w-[48%] 2xl:w-[50%] overflow-hidden bg-[#05070a] border-l border-white/[0.06] pointer-events-none select-none">
          <div className="poster-wall">
            <div className="poster-fade-top" aria-hidden="true" />
            <div className="poster-fade-bottom" aria-hidden="true" />
            <div className="poster-fade-left" aria-hidden="true" />

            <div className="poster-row">
              {/* Column 1 */}
              <div className="poster-track">
                <div className="poster-rail" style={{ ["--duration" as string]: "36s" }}>
                  {POSTERS_COL_1.map((src, i) => (
                    <figure key={i} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div className="poster-rail" aria-hidden="true" style={{ ["--duration" as string]: "36s" }}>
                  {POSTERS_COL_1.map((src, i) => (
                    <figure key={`dup-${i}`} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>

              {/* Column 2 (Reverse + Offset) */}
              <div className="poster-track poster-offset">
                <div className="poster-rail poster-reverse" style={{ ["--duration" as string]: "44s" }}>
                  {POSTERS_COL_2.map((src, i) => (
                    <figure key={i} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div
                  className="poster-rail poster-reverse"
                  aria-hidden="true"
                  style={{ ["--duration" as string]: "44s" }}
                >
                  {POSTERS_COL_2.map((src, i) => (
                    <figure key={`dup-${i}`} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>

              {/* Column 3 */}
              <div className="poster-track">
                <div className="poster-rail" style={{ ["--duration" as string]: "52s" }}>
                  {POSTERS_COL_3.map((src, i) => (
                    <figure key={i} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div className="poster-rail" aria-hidden="true" style={{ ["--duration" as string]: "52s" }}>
                  {POSTERS_COL_3.map((src, i) => (
                    <figure key={`dup-${i}`} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>

              {/* Column 4 (Reverse + Offset) */}
              <div className="poster-track poster-offset">
                <div className="poster-rail poster-reverse" style={{ ["--duration" as string]: "38s" }}>
                  {POSTERS_COL_4.map((src, i) => (
                    <figure key={i} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div
                  className="poster-rail poster-reverse"
                  aria-hidden="true"
                  style={{ ["--duration" as string]: "38s" }}
                >
                  {POSTERS_COL_4.map((src, i) => (
                    <figure key={`dup-${i}`} className="poster-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" loading="lazy" />
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}