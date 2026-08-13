import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonStyleOptions {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function getButtonClasses({ variant = "primary", size = "md", className = "" }: ButtonStyleOptions): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 ease-out select-none disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<Variant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/80",
    ghost: "bg-transparent text-foreground hover:bg-secondary",
    outline: "bg-transparent border border-border text-foreground hover:bg-secondary",
  };

  const sizes: Record<Size, string> = {
    sm: "h-8 px-4 text-xs",
    md: "h-10 px-6 text-sm",
    lg: "h-12 px-8 text-base",
  };

  return [base, variants[variant], sizes[size], className].join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button className={getButtonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }: ButtonLinkProps) {
  return (
    <a className={getButtonClasses({ variant, size, className })} {...props}>
      {children}
    </a>
  );
}