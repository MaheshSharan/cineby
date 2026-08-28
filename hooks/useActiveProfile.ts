import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CLASSIC_AVATARS } from "@/lib/profile/avatars";

export interface ActiveProfile {
  id: string;
  name: string;
  avatarUrl: string;
}

function getRandomClassicAvatar(): string {
  return CLASSIC_AVATARS[Math.floor(Math.random() * Math.min(12, CLASSIC_AVATARS.length))].url;
}

/**
 * Build the per-user localStorage key for the active profile.
 */
function activeProfileKey(userId: number): string {
  return `cineby_active_profile_${userId}`;
}

/**
 * Reads the active profile from localStorage for a specific user.
 * Returns the stored profile, or null if none is set.
 */
function readActiveProfile(userId: number | null): ActiveProfile | null {
  if (typeof window === "undefined" || userId === null) return null;

  try {
    const key = activeProfileKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ActiveProfile;
    // Sanitize legacy avatar URLs
    if (parsed.avatarUrl && !parsed.avatarUrl.startsWith("/avatar/")) {
      parsed.avatarUrl = getRandomClassicAvatar();
      localStorage.setItem(key, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Hook providing the active profile across the entire app.
 * Scoped per user ID so different accounts never share profile data.
 * Listens for storage events so changes in profiles.tsx are
 * reflected instantly in Header, Dock, ProfileDropdown, etc.
 */
export function useActiveProfile() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(() =>
    readActiveProfile(userId)
  );

  const refreshProfile = useCallback(() => {
    setActiveProfile(readActiveProfile(userId));
  }, [userId]);

  // Re-read when user changes (login/logout/switch account)
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    // Listen for same-tab storage events dispatched by profiles.tsx
    const handleStorage = (e: StorageEvent) => {
      if (userId === null) return;
      const key = activeProfileKey(userId);
      if (e.key === key || e.key === null) {
        refreshProfile();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshProfile, userId]);

  return { activeProfile, refreshProfile };
}
