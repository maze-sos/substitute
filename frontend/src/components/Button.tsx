import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const VARIANTS = {
  primary: "bg-terracotta text-cream hover:bg-terracotta-dark disabled:hover:bg-terracotta",
  secondary: "border border-sand-dark bg-white/70 text-ink-soft hover:border-terracotta hover:text-terracotta-dark",
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      {...props}
      className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  );
}
