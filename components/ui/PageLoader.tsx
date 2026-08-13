interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className = "" }: PageLoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-neo-bg ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40 [animation-duration:0.9s]" />
        <picture>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain opacity-80"
          />
        </picture>
      </div>
    </div>
  );
}