import type { ReactNode } from "react";
import { AlertTriangle, ChefHat, type LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-dark border-t-terracotta" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = ChefHat, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-sand-dark bg-cream-dim px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-ink-soft">
        <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-terracotta/30 bg-terracotta/10 px-6 py-16 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/15 text-terracotta-dark">
        <AlertTriangle aria-hidden="true" size={20} strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-medium text-terracotta-dark">Something went wrong</h3>
      <p className="max-w-sm text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
}
