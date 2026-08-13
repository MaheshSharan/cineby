import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import type { User } from "@/lib/db/types";
import { AuthModal, type AuthMode } from "@/components/auth/AuthModal";
import { Toast } from "@/components/ui/Toast";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthMode) => void;
  redirectToLogin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>("login");

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const clearToast = () => {
    setToastMessage(null);
  };

  const refresh = async () => {
    try {
      const response = await fetch("/api/auth/me");

      if (response.ok) {
        const data = (await response.json()) as { user: User | null };
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Logged out successfully");
    } finally {
      setUser(null);
    }
  };

  const openAuthModal = (mode: AuthMode = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const redirectToLogin = () => {
    openAuthModal("login");
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (router.pathname === "/login") {
      setAuthModalMode("login");
      setAuthModalOpen(true);
    } else if (router.pathname === "/register") {
      setAuthModalMode("register");
      setAuthModalOpen(true);
    } else if (router.pathname !== "/login" && router.pathname !== "/register") {
      setAuthModalOpen(false);
    }
  }, [router.pathname, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        toastMessage,
        showToast,
        clearToast,
        refresh,
        logout,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        redirectToLogin,
      }}
    >
      {children}
      <Toast message={toastMessage} onClose={clearToast} />
      <AuthModal
        open={authModalOpen}
        mode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onModeChange={setAuthModalMode}
        onAuthenticated={async () => {
          await refresh();
        }}
        showToast={showToast}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}