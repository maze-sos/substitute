import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select
        {...props}
        className="form-control focus-ring w-full appearance-none pr-9"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={16}
        strokeWidth={2}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
