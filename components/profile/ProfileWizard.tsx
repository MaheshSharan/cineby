import {
  ArrowLeftIcon,
  CheckIcon,
  CompassIcon,
  DramaIcon,
  FlameIcon,
  GhostIcon,
  HeartIcon,
  LaughIcon,
  RocketIcon,
  SparklesIcon,
  TvIcon,
} from "@/components/ui/icons";
import { CLASSIC_AVATARS } from "@/lib/profile/avatars";

interface ProfileWizardProps {
  step: number;
  name: string;
  avatar: string;
  pin: string;
  selectedMovieGenres: string[];
  selectedTvGenres: string[];
  showAllAvatars: boolean;
  isFinishing: boolean;
  onStepChange: (step: number) => void;
  onNameChange: (val: string) => void;
  onAvatarChange: (val: string) => void;
  onPinChange: (val: string) => void;
  onToggleMovieGenre: (id: string) => void;
  onToggleTvGenre: (id: string) => void;
  onShowAllAvatars: () => void;
  onCancel: () => void;
  onFinish: () => void;
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

export function ProfileWizard({
  step,
  name,
  avatar,
  pin,
  selectedMovieGenres,
  selectedTvGenres,
  showAllAvatars,
  isFinishing,
  onStepChange,
  onNameChange,
  onAvatarChange,
  onPinChange,
  onToggleMovieGenre,
  onToggleTvGenre,
  onShowAllAvatars,
  onCancel,
  onFinish,
}: ProfileWizardProps) {
  return (
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
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="text-[12.5px] font-medium text-white">{name || "User"}</span>
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
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) onStepChange(2);
                }}
                className="mt-12 w-full max-w-md border-b border-white/[0.12] bg-transparent pb-4 text-center text-3xl font-bold tracking-tight text-white outline-none transition-colors placeholder:text-white/[0.14] focus:border-white/40 md:text-4xl"
              />
            </div>

            <div className="mt-12 flex w-full max-w-md mx-auto items-center justify-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => onStepChange(2)}
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
                  {(showAllAvatars ? CLASSIC_AVATARS : CLASSIC_AVATARS.slice(0, 12)).map((av) => {
                    const isSelected = avatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => onAvatarChange(av.url)}
                        className={`relative aspect-square w-full rounded-full overflow-hidden border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-white ring-2 ring-white/70"
                            : "border-white/[0.08] hover:border-white/40"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={av.url} alt="" className="h-full w-full object-cover" />
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

                {!showAllAvatars && CLASSIC_AVATARS.length > 12 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={onShowAllAvatars}
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
                onClick={() => onStepChange(1)}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <ArrowLeftIcon size={15} /> Back
              </button>
              <button
                type="button"
                onClick={() => onStepChange(3)}
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
                      onPinChange(val);
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
                onClick={() => onStepChange(2)}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <ArrowLeftIcon size={15} /> Back
              </button>
              <button
                type="button"
                onClick={() => onStepChange(4)}
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
                {MOVIE_GENRES.map(({ id, name: gName, Icon }) => {
                  const isSelected = selectedMovieGenres.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onToggleMovieGenre(id)}
                      className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
                        isSelected
                          ? "border-white bg-white text-[#0b0f14]"
                          : "border-white/[0.1] bg-white/[0.03] text-white/70 hover:border-white/[0.28] hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{gName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 flex w-full max-w-md mx-auto items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onStepChange(3)}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <ArrowLeftIcon size={15} /> Back
              </button>
              <button
                type="button"
                onClick={() => onStepChange(5)}
                className="h-11 px-4 text-[13px] font-medium text-white/60 transition-colors hover:text-white cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => onStepChange(5)}
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
                {TV_GENRES.map(({ id, name: gName, Icon }) => {
                  const isSelected = selectedTvGenres.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onToggleTvGenre(id)}
                      className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
                        isSelected
                          ? "border-white bg-white text-[#0b0f14]"
                          : "border-white/[0.1] bg-white/[0.03] text-white/70 hover:border-white/[0.28] hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{gName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 flex w-full max-w-md mx-auto items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onStepChange(4)}
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 text-[13px] font-medium text-white/70 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <ArrowLeftIcon size={15} /> Back
              </button>
              <button
                type="button"
                onClick={onFinish}
                disabled={isFinishing}
                className="h-11 px-4 text-[13px] font-medium text-white/60 transition-colors hover:text-white cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                disabled={isFinishing}
                onClick={onFinish}
                className="flex h-11 items-center justify-center rounded-full bg-white px-8 text-[13px] font-semibold text-[#0b0f14] transition-all hover:bg-white/90 disabled:opacity-50 flex-1 cursor-pointer"
              >
                {isFinishing ? "Setting up..." : "Start watching"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
