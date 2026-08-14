interface EpisodeNavigationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function EpisodeNavigation({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: EpisodeNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Previous episode"
        title={hasPrevious ? "Previous episode" : "No previous episode"}
        className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 active:scale-110 active:bg-white/30 disabled:opacity-40 disabled:pointer-events-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.25em"
          height="1.25em"
          viewBox="0 0 26 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14.6667 11.6667L10 16.3333M10 16.3333L14.6667 21M10 16.3333H19.3333C20.571 16.3333 21.758 15.8417 22.6332 14.9665C23.5083 14.0913 24 12.9043 24 11.6667C24 10.429 23.5083 9.242 22.6332 8.36683C21.758 7.49167 20.571 7 19.3333 7H17"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next episode"
        title={hasNext ? "Next episode" : "No next episode"}
        className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 active:scale-110 active:bg-white/30 disabled:opacity-40 disabled:pointer-events-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.25em"
          height="1.25em"
          viewBox="0 0 25 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13.6667 12.3333L9 7.66667M9 7.66667L13.6667 3M9 7.66667H18.3333C19.571 7.66667 20.758 8.15833 21.6332 9.0335C22.5083 9.90867 23 11.0957 23 12.3333C23 13.571 22.5083 14.758 21.6332 15.6332C20.758 16.5083 19.571 17 18.3333 17H16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
