import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Users, UtensilsCrossed } from "lucide-react";
import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { LoadingState, ErrorBanner, EmptyState } from "../components/states";
import { RecipePlaceholderArt } from "../components/RecipePlaceholderArt";
import { RecipeCard } from "../components/RecipeCard";
import { Tag } from "../components/Tag";
import { formatCuisineName } from "../lib/cuisineTheme";
import type { RecipeDetail as RecipeDetailType, RecipeWithScore } from "../types";

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    data: recipe,
    loading,
    error,
    refetch,
  } = useApi<RecipeDetailType>(() => api.getRecipe(id!), [id]);
  const { data: similar } = useApi<RecipeWithScore[]>(() => api.getSimilarRecipes(id!), [id]);

  if (loading) return <LoadingState label="Loading recipe…" />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-8"><ErrorBanner message={error} onRetry={refetch} /></div>;
  if (!recipe) return null;

  const required = recipe.ingredients.filter((i) => !i.optional);
  const optional = recipe.ingredients.filter((i) => i.optional);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-terracotta-dark hover:underline"
      >
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
        Back to recipes
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-sand">
        <RecipePlaceholderArt cuisine={recipe.cuisine} className="h-48 w-full" />
        <div className="bg-white/60 p-6">
          <h1 className="font-display text-2xl font-semibold text-ink">{recipe.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{formatCuisineName(recipe.cuisine)}</span>
            {recipe.prep_minutes && (
              <span className="inline-flex items-center gap-1">
                <Clock aria-hidden="true" size={14} strokeWidth={2} />
                {recipe.prep_minutes} min
              </span>
            )}
            {recipe.servings && (
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden="true" size={14} strokeWidth={2} />
                serves {recipe.servings}
              </span>
            )}
          </div>
          {recipe.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {recipe.tags.map((t) => (
                <Tag key={t} tag={t} tone="olive" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[1fr_1.4fr]">
        <section>
          <h2 className="font-display text-lg font-medium text-ink">Ingredients</h2>
          <ul className="mt-3 space-y-2">
            {required.map((use) => (
              <li key={use.ingredient.id} className="flex items-baseline justify-between gap-2 text-sm">
                <Link
                  to={`/ingredients/${use.ingredient.id}`}
                  className="focus-ring rounded text-ink-soft hover:text-terracotta-dark hover:underline"
                >
                  {use.ingredient.name}
                </Link>
                <span className="whitespace-nowrap text-muted">
                  {[use.quantity, use.unit].filter(Boolean).join(" ")}
                </span>
              </li>
            ))}
          </ul>
          {optional.length > 0 && (
            <>
              <h3 className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">Optional</h3>
              <ul className="mt-2 space-y-2">
                {optional.map((use) => (
                  <li key={use.ingredient.id} className="flex items-baseline justify-between gap-2 text-sm">
                    <Link
                      to={`/ingredients/${use.ingredient.id}`}
                      className="focus-ring rounded text-muted hover:text-terracotta-dark hover:underline"
                    >
                      {use.ingredient.name}
                    </Link>
                    <span className="whitespace-nowrap text-muted">
                      {[use.quantity, use.unit].filter(Boolean).join(" ")}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg font-medium text-ink">Instructions</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {recipe.instructions}
          </p>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-medium text-ink">Similar recipes</h2>
        <p className="mt-1 text-sm text-muted">Recipes that share the most ingredients with this one.</p>
        {similar && similar.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            title="No overlap found"
            description="No other recipes share ingredients with this one yet."
          />
        )}
        {similar && similar.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((r) => (
              <RecipeCard key={r.id} recipe={r} badge={`${r.shared_ingredients} shared`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
