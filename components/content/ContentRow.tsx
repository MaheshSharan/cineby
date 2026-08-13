import { useCallback, useRef, useState, useEffect, type ReactNode } from "react";

interface ContentRowProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ContentRow({ title, action, children, className = "" }: ContentRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    checkScrollState();
    scroller.addEventListener("scroll", checkScrollState);
    window.addEventListener("resize", checkScrollState);

    return () => {
      scroller.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState, children]);

  const scrollByPage = useCallback((direction: "left" | "right") => {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const pageSize = scroller.clientWidth * 0.75;
    scroller.scrollBy({ left: direction === "left" ? -pageSize : pageSize, behavior: "smooth" });
  }, []);

  return (
    <section className={`group/row relative ${className}`}>
      {title || action ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title ? (
            <h2 className="heading-trail text-xl font-semibold text-text-hi md:text-2xl">
              {title}
            </h2>
          ) : (
            <div />
          )}
          {action ? <div className="flex-shrink-0">{action}</div> : null}
        </div>
      ) : null}

      <div className="relative w-full">
        {canScrollLeft ? (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByPage("left")}
            className="absolute left-0 top-0 bottom-2 z-20 flex w-12 items-center justify-start bg-gradient-to-r from-[#05070a] via-[#05070a]/70 to-transparent text-white/70 opacity-0 transition-all duration-300 hover:text-white group-hover/row:opacity-100"
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : null}

        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2"
        >
          {children}
        </div>

        {canScrollRight ? (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByPage("right")}
            className="absolute right-0 top-0 bottom-2 z-20 flex w-12 items-center justify-end bg-gradient-to-l from-[#05070a] via-[#05070a]/70 to-transparent pr-2 text-white/70 opacity-0 transition-all duration-300 hover:text-white group-hover/row:opacity-100"
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : null}
      </div>
    </section>
  );
}