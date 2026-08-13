import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
  durationMs?: number;
}

export function Toast({ message, onClose, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [message, onClose, durationMs]);

  if (!message) {
    return null;
  }

  return (
    <div
      id="_rht_toaster"
      className="pointer-events-none fixed inset-x-6 top-20 z-[9999] flex justify-end"
    >
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#05070a]/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
}