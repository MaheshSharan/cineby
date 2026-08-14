import { useRef, useState } from "react";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function SeekBar({ currentTime, duration, onSeek }: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const hoverProgress = hoverTime !== null && duration > 0 ? (hoverTime / duration) * 100 : 0;

  const getTimeFromEvent = (clientX: number): number => {
    const track = trackRef.current;
    if (!track || duration <= 0) {
      return 0;
    }

    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

    return ratio * duration;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    setHoverTime(getTimeFromEvent(event.clientX));
  };

  const handlePointerLeave = () => {
    setHoverTime(null);
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    onSeek(getTimeFromEvent(event.clientX));
  };

  return (
    <div
      ref={trackRef}
      className="relative z-20 flex h-9 w-full flex-1 cursor-pointer items-center group"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleSeek}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      tabIndex={0}
    >
      <div className="absolute inset-y-0 left-0 right-0 flex items-center">
        <div className="relative h-[3px] w-full overflow-visible rounded-full transition-all duration-150 group-hover:h-[5px]">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 rounded-full bg-white/25 transition-colors duration-150 group-hover:bg-white/30" />

            {hoverProgress > 0 ? (
              <div
                className="absolute inset-0 rounded-full bg-white/15"
                style={{ width: `${hoverProgress}%` }}
              />
            ) : null}

            <div
              className="absolute left-0 top-0 h-full rounded-full bg-primary transition-none"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
