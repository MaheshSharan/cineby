import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { AvatarModal } from "@/components/profile/AvatarModal";
import {
  ArrowLeftIcon,
  CheckIcon,
  CompassIcon,
  DramaIcon,
  FlameIcon,
  GhostIcon,
  HeartIcon,
  LaughIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
  RocketIcon,
  SparklesIcon,
  TrashIcon,
  TvIcon,
} from "@/components/ui/icons";
import { CLASSIC_AVATARS } from "@/lib/profile/avatars";

interface ProfileData {
  id: string;
  name: string;
  avatarUrl: string;
  pin?: string;
  movieGenres?: string[];
  tvGenres?: string[];
}

const MOVIE_GENRES = [
  { id: "comedy", name: "Comedy", Icon: LaughIcon },
  { id: "action", name: "Action", Icon: FlameIcon },
  { id: "drama", name: "Drama", Icon: DramaIcon },
  { id: "horror", name: "Horror", Icon: GhostIcon },
  { id: "romance", name: "Romance", Icon: HeartIcon },
  { id: "adventure", name: "Adventure", Icon: CompassIcon },
  { id: "scifi", name: "Science Fiction", Icon: RocketIcon },
  { id: "thriller", name: "Thriller", Icon: FlameIcon },
  { id: "animation", name: "Animation", Icon: SparklesIcon },
];

const TV_GENRES = [
  { id: "comedy", name: "Comedy", Icon: LaughIcon },
  { id: "drama", name: "Drama", Icon: DramaIcon },
  { id: "action", name: "Action & Adventure", Icon: FlameIcon },
  { id: "scifi", name: "Sci-Fi & Fantasy", Icon: RocketIcon },
  { id: "mystery", name: "Mystery", Icon: CompassIcon },
  { id: "animation", name: "Animation", Icon: SparklesIcon },
  { id: "documentary", name: "Documentary", Icon: TvIcon },
];

function profilesKey(userId: number): string {
  return `cineby_profiles_${userId}`;
}

function activeProfileKey(userId: number): string {
  return `cineby_active_profile_${userId}`;
}

export default function ProfilesPage() {
  const router = useRouter();
  const { user, showToast } = useAuth();

  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileData | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPinEnabled, setEditPinEnabled] = useState(false);
  const [editPin, setEditPin] = useState("");

  // Wizard state
  const [isCreating, setIsCreating] = useState(
    () => typeof window !== "undefined" && window.location.search.includes("create=true")
  );
  const [step, setStep] = useState(1);
  const [showAllWizardAvatars, setShowAllWizardAvatars] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(CLASSIC_AVATARS[0].url);
  const [pin, setPin] = useState("");
  const [selectedMovieGenres, setSelectedMovieGenres] = useState<string[]>([]);
  const [selectedTvGenres, setSelectedTvGenres] = useState<string[]>([]);

  // Per-user storage keys
  const PROFILES_KEY = user ? profilesKey(user.id) : null;
  const ACTIVE_KEY = user ? activeProfileKey(user.id) : null;

  // Load profiles from storage (scoped per user)
  useEffect(() => {
    if (typeof window === "undefined" || !user || !PROFILES_KEY || !ACTIVE_KEY) return;

    const isOnboarding = window.location.search.includes("create=true");

    // Migrate old unscoped keys to new per-user keys (one-time)
    try {
      const legacyProfiles = localStorage.getItem("cineby_profiles");
      const legacyActive = localStorage.getItem("cineby_active_profile");
      if (legacyProfiles && !localStorage.getItem(PROFILES_KEY)) {
        localStorage.setItem(PROFILES_KEY, legacyProfiles);
        if (legacyActive) {
          localStorage.setItem(ACTIVE_KEY, legacyActive);
        }
      }
      localStorage.removeItem("cineby_profiles");
      localStorage.removeItem("cineby_active_profile");
    } catch {
      // ignore migration errors
    }

    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProfileData[];
        // Sanitize any legacy / external avatar URLs to local classic avatars
        const sanitized = parsed.map((p, idx) => ({
          ...p,
          avatarUrl:
            p.avatarUrl && p.avatarUrl.startsWith("/avatar/")
              ? p.avatarUrl
              : CLASSIC_AVATARS[idx % CLASSIC_AVATARS.length].url,
        }));
        setProfiles(sanitized);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(sanitized));

        // Also sanitize active profile if needed
        const activeStr = localStorage.getItem(ACTIVE_KEY);
        if (activeStr) {
          const activeObj = JSON.parse(activeStr) as ProfileData;
          if (!activeObj.avatarUrl || !activeObj.avatarUrl.startsWith("/avatar/")) {
            const match = sanitized.find((s) => s.id === activeObj.id) || sanitized[0];
            localStorage.setItem(ACTIVE_KEY, JSON.stringify(match));
          }
        }
      } else if (!isOnboarding) {
        // Only auto-create a default profile if NOT in onboarding flow.
        const randomAvatar = CLASSIC_AVATARS[Math.floor(Math.random() * 12)].url;
        const defaultProfile: ProfileData = {
          id: "default-1",
          name: user.displayName || user.email.split("@")[0],
          avatarUrl:
            user.avatarUrl && user.avatarUrl.startsWith("/avatar/")
              ? user.avatarUrl
              : randomAvatar,
        };
        setProfiles([defaultProfile]);
        localStorage.setItem(PROFILES_KEY, JSON.stringify([defaultProfile]));
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(defaultProfile));
      }
    } catch {
      // ignore
    }
  }, [user, PROFILES_KEY, ACTIVE_KEY]);


  // Check if wizard was explicitly opened via URL query
  useEffect(() => {
    if (router.query.create === "true") {
      setIsCreating(true);
      setStep(1);
    }
  }, [router.query.create]);

  const handleCancelWizard = () => {
    setIsCreating(false);
    router.replace("/profiles", undefined, { shallow: true });

    // If user cancelled onboarding and has no profiles yet, auto-create one
    if (profiles.length === 0 && PROFILES_KEY && ACTIVE_KEY) {
      const randomAvatar = CLASSIC_AVATARS[Math.floor(Math.random() * 12)].url;
      const fallbackName = user?.displayName || user?.email?.split("@")[0] || "User";
      const defaultProfile: ProfileData = {
        id: `profile-${Date.now()}`,
        name: fallbackName,
        avatarUrl: randomAvatar,
      };
      const list = [defaultProfile];
      setProfiles(list);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(defaultProfile));
    }
  };

  const handleSelectProfile = (profile: ProfileData) => {
    if (isManaging) {
      handleOpenEditProfile(profile);
      return;
    }

    if (!ACTIVE_KEY) return;

    localStorage.setItem(ACTIVE_KEY, JSON.stringify(profile));
    // Dispatch storage event so useActiveProfile hooks in Header/Dock update instantly
    window.dispatchEvent(new StorageEvent("storage", { key: ACTIVE_KEY }));
    showToast(`Switched to ${profile.name}`);
    router.push("/");
  };

  const handleOpenEditProfile = (profile: ProfileData) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditAvatar(profile.avatarUrl);
    setEditPinEnabled(!!profile.pin);
    setEditPin(profile.pin || "");
  };

  const handleSaveEditProfile = () => {
    if (!editingProfile || !PROFILES_KEY || !ACTIVE_KEY) return;

    const trimmedName = editName.trim() || editingProfile.name;
    const updatedProfile: ProfileData = {
      ...editingProfile,
      name: trimmedName,
      avatarUrl: editAvatar,
      pin: editPinEnabled && editPin.trim() ? editPin.trim() : undefined,
    };

    const updatedList = profiles.map((p) => (p.id === editingProfile.id ? updatedProfile : p));
    setProfiles(updatedList);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedList));

    // Update active profile if this was active
    try {
      const activeStr = localStorage.getItem(ACTIVE_KEY);
      if (activeStr) {
        const activeObj = JSON.parse(activeStr) as ProfileData;
        if (activeObj.id === editingProfile.id) {
          localStorage.setItem(ACTIVE_KEY, JSON.stringify(updatedProfile));
          window.dispatchEvent(new StorageEvent("storage", { key: ACTIVE_KEY }));
        }
      }
    } catch {
      // ignore
    }

    showToast("Profile updated");
    setEditingProfile(null);
  };

  const handleDeleteProfile = () => {
    if (!editingProfile || !PROFILES_KEY || !ACTIVE_KEY) return;

    if (profiles.length <= 1) {
      showToast("Cannot delete your only profile");
      return;
    }

    const updatedList = profiles.filter((p) => p.id !== editingProfile.id);
    setProfiles(updatedList);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedList));

    // If active profile was deleted, switch to the first remaining
    try {
      const activeStr = localStorage.getItem(ACTIVE_KEY);
      if (activeStr) {
        const activeObj = JSON.parse(activeStr) as ProfileData;
        if (activeObj.id === editingProfile.id) {
          localStorage.setItem(ACTIVE_KEY, JSON.stringify(updatedList[0]));
          window.dispatchEvent(new StorageEvent("storage", { key: ACTIVE_KEY }));
        }
      }
    } catch {
      // ignore
    }

    showToast("Profile deleted");
    setEditingProfile(null);
  };

  const handleStartWizard = () => {
    setIsCreating(true);
    setStep(1);
    setProfileName("");
    setSelectedAvatar(CLASSIC_AVATARS[0].url);
    setPin("");
    setSelectedMovieGenres([]);
    setSelectedTvGenres([]);
  };

  const handleFinishWizard = () => {
    if (!PROFILES_KEY || !ACTIVE_KEY) return;

    const newProfile: ProfileData = {
      id: `profile-${Date.now()}`,
      name: profileName.trim() || "User",
      avatarUrl: selectedAvatar,
      pin: pin.trim() || undefined,
      movieGenres: selectedMovieGenres,
      tvGenres: selectedTvGenres,
    };

    // If this is the first profile (fresh onboarding), replace instead of append
    const updated = profiles.length === 0 ? [newProfile] : [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(newProfile));
    window.dispatchEvent(new StorageEvent("storage", { key: ACTIVE_KEY }));

    setIsCreating(false);
    showToast(`Welcome, ${newProfile.name}!`);
    router.push("/");
  };



  const toggleGenre = (
    genreId: string,
    currentList: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentList.includes(genreId)) {
      setter(currentList.filter((id) => id !== genreId));
    } else if (currentList.length < 3) {
      setter([...currentList, genreId]);
    }
  };

  return (
    <>
      <Head>
        <title>
          {editingProfile
            ? "Edit profile"
            : isCreating
            ? "Create your profile"
            : "Who's watching?"}{" "}
          - Cineby
        </title>
      </Head>

      <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#05070a] text-white">
        {/* Ambient Red Radial Gradient */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-[390px] left-1/2 h-[900px] w-[1200px] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(closest-side, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.04) 35%, rgba(220, 38, 38, 0.02) 60%, rgba(220, 38, 38, 0.01) 80%, rgba(220, 38, 38, 0) 100%)",
            }}
          />
        </div>

        <div className="relative flex min-h-[100dvh] items-center justify-center px-6 py-14">
          {editingProfile ? (
            /* ================= VIEW C: EDIT PROFILE SETTINGS ================= */
            <div className="flex w-full justify-center animate-in fade-in duration-300">
              <div className="flex w-full max-w-xl flex-col items-center text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Edit profile
                </h1>

                <div className="mt-8 w-full">
                  <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-left md:p-6">
                    {/* Look & Name Section */}
                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        aria-label="Choose your look"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="relative shrink-0 cursor-pointer group"
                      >
                        <span className="relative block h-20 w-20 overflow-hidden rounded-full border border-white/[0.1] transition-all group-hover:border-white/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editAvatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0f14] bg-white text-[#0b0f14] shadow-md transition-transform group-hover:scale-110">
                          <PencilIcon size={12} strokeWidth={2.5} />
                        </span>
                      </button>

                      <div className="min-w-0 flex-1">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                          Profile name
                        </label>
                        <input
                          type="text"
                          maxLength={20}
                          placeholder="Profile name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[14px] font-medium text-white outline-none transition-colors placeholder:text-white/40 focus:border-white/[0.3] focus:bg-white/[0.05]"
                        />
                      </div>
                    </div>

                    <div className="my-5 h-px bg-white/[0.06]" />

                    {/* PIN Section */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                          <LockIcon size={13} className="text-white/50" />
                          Profile PIN
                        </span>
                        <p className="mt-1.5 max-w-[300px] text-[12px] leading-relaxed text-white/50">
                          Require a 4-digit PIN to open this profile. Others on this account can&apos;t use it without the code.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={editPinEnabled}
                        aria-label="Profile PIN"
                        onClick={() => setEditPinEnabled((prev) => !prev)}
                        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${
                          editPinEnabled ? "bg-primary" : "bg-white/[0.14]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-200 ${
                            editPinEnabled ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {editPinEnabled && (
                      <div className="mt-4 pt-3 border-t border-white/[0.04]">
                        <input
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          placeholder="Enter 4-digit PIN"
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ""))}
                          className="h-10 w-44 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-center text-sm font-semibold tracking-widest text-white outline-none focus:border-white/30"
                        />
                      </div>
                    )}

                    <div className="my-5 h-px bg-white/[0.06]" />

                    {/* Delete Section */}
                    <div>
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                        <TrashIcon size={13} className="text-white/50" />
                        Delete
                      </span>
                      <p className="mt-1.5 max-w-[420px] text-[12px] leading-relaxed text-white/50">
                        This cannot be undone. History, continue watching, and the watchlist for this profile will be permanently deleted.
                      </p>
                      <button
                        type="button"
                        onClick={handleDeleteProfile}
                        className="mt-3 text-left text-[12.5px] font-medium text-primary transition-colors hover:text-primary/80 cursor-pointer"
                      >
                        I understand and want to delete this profile
                      </button>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-6 flex w-full items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(null)}
                      className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                    >
                      <ArrowLeftIcon size={15} />
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!editName.trim()}
                      onClick={handleSaveEditProfile}
                      className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : !isCreating ? (
            /* ================= VIEW A: WHO'S WATCHING? ================= */
            <div className="flex w-full justify-center animate-in fade-in duration-300">
              <div className="flex w-full max-w-3xl flex-col items-center text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-[42px] md:leading-tight">
                  Who&apos;s watching?
                </h1>

                <div className="relative mt-10 flex flex-wrap items-start justify-center gap-6 md:mt-12 md:gap-8">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProfile(p)}
                      className="group flex w-24 flex-col items-center md:w-32 cursor-pointer"
                    >
                      <span className="relative block aspect-square w-full overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] transition-all duration-200 group-hover:border-white/40 group-hover:scale-105">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                        {/* Pencil Edit Badge overlay in Manage Mode */}
                        {isManaging && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px] rounded-full border border-white/20 transition-transform group-hover:scale-105">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white border border-white/30 shadow-lg">
                              <PencilIcon size={16} strokeWidth={2.2} />
                            </span>
                          </span>
                        )}
                      </span>
                      <span className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13px] text-white/70 transition-colors group-hover:text-white md:text-sm font-medium">
                        <span className="truncate">{p.name}</span>
                      </span>
                    </button>
                  ))}

                  {/* Add Profile Button */}
                  <button
                    type="button"
                    onClick={handleStartWizard}
                    className="group flex w-24 flex-col items-center md:w-32 cursor-pointer"
                  >
                    <span className="flex aspect-square w-full items-center justify-center rounded-full border border-dashed border-white/[0.14] bg-white/[0.02] transition-colors duration-200 group-hover:border-white/30 group-hover:bg-white/[0.05]">
                      <PlusIcon size={32} className="text-white/30 transition-colors group-hover:text-white/70" />
                    </span>
                    <span className="mt-3 w-full truncate text-[13px] text-white/70 transition-colors group-hover:text-white md:text-sm font-medium">
                      Add profile
                    </span>
                  </button>
                </div>

                <div className="mt-12 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsManaging((prev) => !prev)}
                    className="h-10 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                  >
                    {isManaging ? "Done" : "Manage profiles"}
                  </button>
                  {!isManaging && (
                    <button
                      type="button"
                      onClick={() => router.push("/")}
                      className="h-10 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                    >
                      Settings
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= VIEW B: 5-STEP PROFILE CREATION ================= */
            <div className="flex w-full justify-center animate-in fade-in duration-300">
              <div className="flex w-full max-w-3xl flex-col items-center text-center">
                {/* 5-Step Progress Indicators */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <span
                      key={idx}
                      className="h-[7px] rounded-full transition-all duration-300"
                      style={{
                        width: step === idx ? "26px" : "7px",
                        backgroundColor:
                          step === idx
                            ? "rgba(255, 255, 255, 0.9)"
                            : step > idx
                            ? "rgba(255, 255, 255, 0.45)"
                            : "rgba(255, 255, 255, 0.14)",
                      }}
                    />
                  ))}
                </div>

                {/* Profile pill preview (Steps 2-5) */}
                {step > 1 && (
                  <div className="mt-6 flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-4 animate-in fade-in">
                    <span className="relative block h-7 w-7 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.06]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedAvatar} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="text-[12.5px] font-medium text-white">{profileName || "User"}</span>
                  </div>
                )}

                {/* STEP 1: Name */}
                {step === 1 && (
                  <div className="mt-8 w-full md:mt-10 animate-in fade-in duration-200">
                    <div className="flex flex-col items-center">
                      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Create your profile
                      </h1>
                      <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-white/60">
                        Give it a name — this is who&apos;s watching
                      </p>
                      <input
                        type="text"
                        maxLength={20}
                        autoFocus
                        placeholder="Profile name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && profileName.trim()) setStep(2);
                        }}
                        className="mt-12 w-full max-w-md border-b border-white/[0.12] bg-transparent pb-4 text-center text-3xl font-bold tracking-tight text-white outline-none transition-colors placeholder:text-white/[0.14] focus:border-white/40 md:text-4xl"
                      />
                    </div>

                    <div className="mt-12 flex w-full max-w-md mx-auto items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleCancelWizard}
                        className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!profileName.trim()}
                        onClick={() => setStep(2)}
                        className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30 flex-1 cursor-pointer"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Avatar Picker */}
                {step === 2 && (
                  <div className="mt-8 w-full md:mt-10 animate-in fade-in duration-200">
                    <div className="flex flex-col items-center">
                      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Choose your look
                      </h1>
                      <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-white/60">
                        Pick an avatar that feels like this profile
                      </p>

                      <div className="mt-8 max-h-[46vh] w-full max-w-2xl overflow-y-auto px-1 pb-2 scrollbar-styles">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {(showAllWizardAvatars ? CLASSIC_AVATARS : CLASSIC_AVATARS.slice(0, 12)).map((avatar) => {
                            const isSelected = selectedAvatar === avatar.url;
                            return (
                              <button
                                key={avatar.id}
                                type="button"
                                onClick={() => setSelectedAvatar(avatar.url)}
                                className={`relative aspect-square w-full rounded-full overflow-hidden border transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? "border-white ring-2 ring-white/70"
                                    : "border-white/[0.08] hover:border-white/40"
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={avatar.url} alt="" className="h-full w-full object-cover" />
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/45">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0b0f14]">
                                      <CheckIcon size={14} strokeWidth={3} />
                                    </span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {!showAllWizardAvatars && CLASSIC_AVATARS.length > 12 && (
                          <div className="mt-4 flex justify-center">
                            <button
                              type="button"
                              onClick={() => setShowAllWizardAvatars(true)}
                              className="h-9 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 text-[12.5px] font-medium text-white/70 transition-colors hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white cursor-pointer"
                            >
                              Show more
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex w-full max-w-md mx-auto items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                      >
                        <ArrowLeftIcon size={15} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 flex-1 cursor-pointer"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Lock with PIN */}
                {step === 3 && (
                  <div className="mt-8 w-full md:mt-10 animate-in fade-in duration-200">
                    <div className="flex flex-col items-center">
                      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        Lock it with a PIN?
                      </h1>
                      <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-white/60">
                        Only someone with this 4-digit PIN can use the profile. Leave it empty to skip — you can add one later.
                      </p>

                      <div className="mt-12 flex flex-col items-center">
                        <div className="relative inline-flex cursor-text">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            autoFocus
                            value={pin}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setPin(val);
                            }}
                            className="absolute inset-0 z-10 cursor-text opacity-0"
                          />
                          <div className="flex gap-2.5 sm:gap-3">
                            {[0, 1, 2, 3].map((idx) => {
                              const isFilled = pin.length > idx;
                              const isActive = pin.length === idx;
                              return (
                                <div
                                  key={idx}
                                  className={`flex h-[58px] w-[46px] items-center justify-center rounded-xl border text-[22px] font-semibold tabular-nums sm:h-16 sm:w-[52px] sm:text-2xl transition-all duration-200 ${
                                    isActive
                                      ? "border-white bg-white/[0.07] text-white shadow-[0_0_0_3px_rgba(255,255,255,0.1)]"
                                      : isFilled
                                      ? "border-white/30 bg-white/[0.05] text-white"
                                      : "border-white/[0.1] bg-white/[0.03] text-white"
                                  }`}
                                >
                                  {isFilled ? "•" : isActive ? <span className="h-[22px] w-[1.5px] rounded-full bg-white animate-pulse" /> : ""}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex w-full max-w-md mx-auto items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                      >
                        <ArrowLeftIcon size={15} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 flex-1 cursor-pointer"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Movie Genres */}
                {step === 4 && (
                  <div className="mt-8 w-full md:mt-10 animate-in fade-in duration-200">
                    <div className="flex flex-col items-center">
                      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        What movies do you love?
                      </h1>
                      <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-white/60">
                        Pick up to 3 film genres — half of your first For You comes from these.
                      </p>

                      <div className="mt-10 flex max-w-2xl flex-wrap justify-center gap-2.5">
                        {MOVIE_GENRES.map(({ id, name, Icon }) => {
                          const isSelected = selectedMovieGenres.includes(id);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => toggleGenre(id, selectedMovieGenres, setSelectedMovieGenres)}
                              className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
                                isSelected
                                  ? "border-white bg-white text-[#0b0f14]"
                                  : "border-white/[0.1] bg-white/[0.03] text-white/70 hover:border-white/[0.28] hover:text-white"
                              }`}
                            >
                              <Icon size={15} />
                              <span>{name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-12 flex w-full max-w-md mx-auto items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                      >
                        <ArrowLeftIcon size={15} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(5)}
                        className="h-11 px-4 text-[13px] font-medium text-white/60 transition-colors hover:text-white cursor-pointer"
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(5)}
                        className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 flex-1 cursor-pointer"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: TV Genres */}
                {step === 5 && (
                  <div className="mt-8 w-full md:mt-10 animate-in fade-in duration-200">
                    <div className="flex flex-col items-center">
                      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        What series do you love?
                      </h1>
                      <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-white/60">
                        Now pick up to 3 TV genres. The other half of For You is built from these.
                      </p>

                      <div className="mt-10 flex max-w-2xl flex-wrap justify-center gap-2.5">
                        {TV_GENRES.map(({ id, name, Icon }) => {
                          const isSelected = selectedTvGenres.includes(id);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => toggleGenre(id, selectedTvGenres, setSelectedTvGenres)}
                              className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
                                isSelected
                                  ? "border-white bg-white text-[#0b0f14]"
                                  : "border-white/[0.1] bg-white/[0.03] text-white/70 hover:border-white/[0.28] hover:text-white"
                              }`}
                            >
                              <Icon size={15} />
                              <span>{name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-12 flex w-full max-w-md mx-auto items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
                      >
                        <ArrowLeftIcon size={15} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishWizard}
                        className="h-11 px-4 text-[13px] font-medium text-white/60 transition-colors hover:text-white cursor-pointer"
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishWizard}
                        className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 flex-1 cursor-pointer"
                      >
                        Start watching
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Change Avatar Modal in Edit Profile */}
        <AvatarModal
          open={isAvatarModalOpen}
          currentAvatarUrl={editAvatar}
          onSelect={(url) => setEditAvatar(url)}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      </div>
    </>
  );
}

