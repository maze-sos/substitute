export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading recipes">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-sand bg-white/60">
          <div className="h-36 w-full bg-sand" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-3/4 rounded bg-sand" />
            <div className="h-3 w-1/2 rounded bg-sand-dark/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
