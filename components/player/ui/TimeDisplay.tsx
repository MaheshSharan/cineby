interface TimeDisplayProps {
  currentTime: number;
  duration: number;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function TimeDisplay({ currentTime, duration, className = "" }: TimeDisplayProps) {
  return (
    <span
      className={`flex-shrink-0 text-sm font-medium text-white/80 tabular-nums whitespace-nowrap select-none ${className}`}
    >
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  );
}
