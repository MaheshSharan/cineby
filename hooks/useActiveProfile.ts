import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

export interface ActiveProfile {
  id: number;
  name: string;
  avatarUrl: string;
}

interface ProfilesResponse { profiles: Array<ActiveProfile & { hasPin?: boolean }>; activeProfileId?: number; }

/**
 * Hook providing the active profile across the entire app.
 * Scoped per user ID so different accounts never share profile data.
 * Listens for storage events so changes in profiles.tsx are
 * reflected instantly in Header, Dock, ProfileDropdown, etc.
 */
export function useActiveProfile() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);

  const refreshProfile = useCallback(() => {
    if (userId === null) { setActiveProfile(null); return; }
    void fetch("/api/profiles")
      .then((response) => response.ok ? response.json() as Promise<ProfilesResponse> : null)
      .then((data) => setActiveProfile(data?.profiles.find((profile) => profile.id === data.activeProfileId) ?? data?.profiles[0] ?? null))
      .catch(() => setActiveProfile(null));
  }, [userId]);

  // Re-read when user changes (login/logout/switch account)
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    // Listen for same-tab storage events dispatched by profiles.tsx
    return undefined;
  }, [refreshProfile, userId]);

  return { activeProfile, refreshProfile };
}
