import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { LockIcon, UserRoundIcon, XIcon } from "@/components/ui/icons";

export type AuthMode = "login" | "register" | "forgot";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onClose: (mode: AuthMode) => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (username: string, mode: AuthMode) => Promise<void>;
  showToast: (msg: string) => void;
}

export function AuthModal({
  open,
  mode,
  onClose,
  onModeChange,
  onAuthenticated,
  showToast,
}: AuthModalProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    onClose(mode);
    if (router.pathname === "/login" || router.pathname === "/register") {
      router.push("/", undefined, { shallow: true });
    }
  }, [mode, onClose, router]);

  useEffect(() => {
    if (!open) {
      setUsername("");
      setPassword("");
      setConfirmPassword("");
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

    if (mode === "forgot") {
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

        await onAuthenticated(username, mode);
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
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, displayName: username }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      await onAuthenticated(username, mode);
      showToast(mode === "login" ? `${username}, Welcome back!` : "Registered Successfully");
      handleClose();
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
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Login" : mode === "register" ? "Sign up" : "Reset Password"}
        className="glass-card-dark fixed left-1/2 top-1/2 z-[200] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          {mode === "forgot" ? (
            <h2 className="text-base font-semibold text-white">Reset Password</h2>
          ) : (
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "login" ? "text-white" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Login
                {mode === "login" ? (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "register" ? "text-white" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Sign up
                {mode === "register" ? (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </button>
            </div>
          )}

          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="group rounded-lg p-2 transition-colors hover:bg-white/10"
          >
            <XIcon size={20} className="text-gray-400 transition-colors group-hover:text-white" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white/80">
                  <UserRoundIcon size={20} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  placeholder="Username or Email"
                  minLength={3}
                  maxLength={60}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-card-subtle w-full rounded-xl border border-white/15 bg-transparent pl-12 pr-4 py-3 text-white placeholder:text-white/60 transition-colors focus:border-primary/50 focus:outline-none"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white/80">
                  <LockIcon size={20} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  placeholder={mode === "forgot" ? "New Password (min 8 chars)" : "Password"}
                  minLength={8}
                  maxLength={32}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-card-subtle w-full rounded-xl border border-white/15 bg-transparent pl-12 pr-4 py-3 text-white placeholder:text-white/60 transition-colors focus:border-primary/50 focus:outline-none"
                />
              </div>

              {mode === "forgot" ? (
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white/80">
                    <LockIcon size={20} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    minLength={8}
                    maxLength={32}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-card-subtle w-full rounded-xl border border-white/15 bg-transparent pl-12 pr-4 py-3 text-white placeholder:text-white/60 transition-colors focus:border-primary/50 focus:outline-none"
                  />
                </div>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="text-center text-sm text-accent-hi">
                {error}
              </p>
            ) : null}

            {mode === "login" ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleTabChange("forgot")}
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  Forgot your password?
                </button>
              </div>
            ) : mode === "forgot" ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="text-sm text-gray-400 transition-colors hover:text-primary"
                >
                  Remembered your password? Log in
                </button>
              </div>
            ) : null}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-primary/90 py-3 px-6 font-medium text-white shadow-lg transition-all duration-200 hover:bg-primary hover:shadow-primary/20 disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait…"
                  : mode === "login"
                  ? "Login"
                  : mode === "register"
                  ? "Sign up"
                  : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="glass-card-subtle flex-1 rounded-xl border border-gray-400/20 py-3 px-6 font-medium text-gray-300 transition-all duration-200 hover:border-gray-300/30 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}