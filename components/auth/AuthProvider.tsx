import { createContext, useContext, useEffect, useState } from "react";

import type { User } from "@/lib/db/types";
import { Toast } from "@/components/ui/Toast";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, toastMessage, showToast, clearToast, refresh, logout }}
    >
      {children}
      <Toast message={toastMessage} onClose={clearToast} />
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