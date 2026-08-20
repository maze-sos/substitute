import type { ReactNode } from "react";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sand-dark border-t-terracotta" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = "🍽️", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-sand-dark bg-cream-dim px-6 py-16 text-center">
      <span className="text-3xl">{icon}</span>
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-terracotta/30 bg-terracotta/10 px-6 py-16 text-center">
      <span className="text-3xl">⚠️</span>
      <h3 className="font-display text-lg font-medium text-terracotta-dark">Something went wrong</h3>
      <p className="max-w-sm text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full bg-terracotta px-4 py-2 text-sm font-medium text-cream transition hover:bg-terracotta-dark"
        >
          Try again
        </button>
      )}
    </div>
  );
}
