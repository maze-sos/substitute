import { useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { IngredientPicker } from "../components/IngredientPicker";
import { RecipePlaceholderArt } from "../components/RecipePlaceholderArt";
import { LoadingState, EmptyState, ErrorBanner } from "../components/states";
import { formatCuisineName } from "../lib/cuisineTheme";
import type { IngredientBrief, PantryMatch } from "../types";

export function Pantry() {
  const [pantry, setPantry] = useState<IngredientBrief[]>([]);
  const [matches, setMatches] = useState<PantryMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addIngredient(ing: IngredientBrief) {
    setPantry((prev) => (prev.some((p) => p.id === ing.id) ? prev : [...prev, ing]));
  }

  function removeIngredient(id: string) {
    setPantry((prev) => prev.filter((p) => p.id !== id));
  }

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.matchPantry(pantry.map((p) => p.id));
      setMatches(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">What can I cook?</h1>
      <p className="mt-1 text-muted">
        Add what's in your kitchen. We'll find recipes you can make outright — plus ones you can make by
        substituting an ingredient or two.
      </p>

      <div className="mt-6 max-w-sm">
        <IngredientPicker
          placeholder="Add an ingredient…"
          excludeIds={pantry.map((p) => p.id)}
          onSelect={addIngredient}
        />
      </div>

      {pantry.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {pantry.map((ing) => (
            <li
              key={ing.id}
              className="flex items-center gap-1.5 rounded-full bg-olive/15 py-1.5 pl-3 pr-2 text-sm font-medium text-olive-dark"
            >
              {ing.name}
              <button
                type="button"
                onClick={() => removeIngredient(ing.id)}
                aria-label={`Remove ${ing.name}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-olive-dark/70 hover:bg-olive/25 hover:text-olive-dark"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={search}
        disabled={pantry.length === 0 || loading}
        className="mt-5 rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Find recipes
      </button>

      <div className="mt-8">
        {loading && <LoadingState label="Searching the pantry graph…" />}
        {!loading && error && <ErrorBanner message={error} onRetry={search} />}

        {!loading && !error && matches === null && pantry.length === 0 && (
          <EmptyState
            icon="🧺"
            title="Your pantry is empty"
            description="Start adding ingredients above to see what you can cook."
          />
        )}

        {!loading && !error && matches !== null && matches.length === 0 && (
          <EmptyState
            icon="🤔"
            title="Nothing matches yet"
            description="Add a few more staple ingredients — grains, alliums, or a fat/oil — and try again."
          />
        )}

        {!loading && !error && matches && matches.length > 0 && (
          <ul className="flex flex-col gap-3">
            {matches.map((m) => (
              <li key={m.recipe.id} className="flex gap-4 rounded-2xl border border-sand bg-white/60 p-3">
                <RecipePlaceholderArt cuisine={m.recipe.cuisine} className="h-20 w-20 shrink-0 rounded-xl" />
                <div className="flex-1">
                  <Link
                    to={`/recipes/${m.recipe.id}`}
                    className="font-display text-base font-medium text-ink hover:text-terracotta-dark"
                  >
                    {m.recipe.name}
                  </Link>
                  <div className="text-xs text-muted">{formatCuisineName(m.recipe.cuisine)}</div>
                  {m.have_via_substitution.length === 0 ? (
                    <p className="mt-1.5 text-xs font-medium text-olive-dark">
                      You have everything you need ✓
                    </p>
                  ) : (
                    <ul className="mt-1.5 space-y-0.5">
                      {m.have_via_substitution.map((s, i) => (
                        <li key={i} className="text-xs text-muted">
                          use <span className="font-medium text-ink-soft">{s.from_name}</span> instead of{" "}
                          <span className="font-medium text-ink-soft">{s.to_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
