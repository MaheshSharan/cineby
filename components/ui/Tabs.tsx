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
    <div role="tablist" aria-label="Content type" className={`flex items-center gap-6 ${className}`}>
      {options.map((option) => {
        const isActive = option.key === activeKey;

        return (
          <button
            key={option.key}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(option.key)}
            className={`relative pb-1.5 text-sm font-medium transition-colors duration-200 ${
              isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {option.label}
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary transition-all duration-200 ${
                isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}