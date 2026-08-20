import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

export function SearchInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search
        aria-hidden="true"
        size={16}
        strokeWidth={2}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input type="search" {...props} className="form-control focus-ring w-full pl-10" />
    </div>
  );
}
