import { useCallback, useRef, type ReactNode } from "react";

interface ContentRowProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ContentRow({ title, action, children, className = "" }: ContentRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByPage = useCallback((direction: "left" | "right") => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const pageSize = scroller.clientWidth * 0.8;
    scroller.scrollBy({ left: direction === "left" ? -pageSize : pageSize, behavior: "smooth" });
  }, []);

  return (
    <section className={`group/row py-6 ${className}`}>
      {title ? (
        <div className="mb-3 flex items-end justify-between gap-4 px-4 sm:px-6">
          <h2 className="text-[24px] font-semibold uppercase leading-none tracking-[0.05em]">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {action}
            <div className="hidden items-center gap-2 sm:flex">
              <RowArrowButton
                label={`Scroll ${title} left`}
                direction="left"
                onClick={() => scrollByPage("left")}
              />
              <RowArrowButton
                label={`Scroll ${title} right`}
                direction="right"
                onClick={() => scrollByPage("right")}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:px-6"
      >
        {children}
      </div>
    </section>
  );
}

interface RowArrowButtonProps {
  label: string;
  direction: "left" | "right";
  onClick: () => void;
}

function RowArrowButton({ label, direction, onClick }: RowArrowButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-150 hover:bg-secondary"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${direction === "left" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}