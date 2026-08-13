export interface TabOption {
  key: string;
  label: string;
}

interface TabsProps {
  options: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ options, activeKey, onChange, className = "" }: TabsProps) {
  return (
    <div role="tablist" aria-label="Content type" className={`flex items-center gap-4 ${className}`}>
      {options.map((option) => {
        const isActive = option.key === activeKey;

        return (
          <button
            key={option.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(option.key)}
            className={`relative pb-1 text-sm font-medium uppercase transition-colors duration-150 ${
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {option.label}
            <span
              className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary transition-opacity duration-150 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}