import { useCallback, useEffect, useState } from "react";
import { SearchX } from "lucide-react";
import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { RecipeCard } from "../components/RecipeCard";
import { RecipeGridSkeleton } from "../components/RecipeGridSkeleton";
import { EmptyState, ErrorBanner } from "../components/states";
import { SearchInput } from "../components/SearchInput";
import { Select } from "../components/Select";
import type { RecipeBrief } from "../types";

export function Home() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [cuisine, setCuisine] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchRecipes = useCallback(
    () => api.listRecipes({ search, cuisine, limit: 60 }) as Promise<RecipeBrief[]>,
    [search, cuisine],
  );
  const { data: recipes, loading, error, refetch } = useApi(fetchRecipes, [search, cuisine]);

  const { data: cuisines } = useApi(() => api.listCuisines(), []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Find something to cook</h1>
        <p className="mt-1 text-muted">
          Browse the collection, or head to{" "}
          <span className="font-medium text-terracotta-dark">What can I cook?</span> to see what's
          possible with what's already in your kitchen.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="recipe-search">
          Search recipes
        </label>
        <SearchInput
          id="recipe-search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search recipes…"
          className="sm:max-w-xs"
        />
        <label className="sr-only" htmlFor="cuisine-filter">
          Filter by cuisine
        </label>
        <Select
          id="cuisine-filter"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="sm:w-56"
        >
          <option value="">All cuisines</option>
          {cuisines?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {loading && <RecipeGridSkeleton />}
      {!loading && error && <ErrorBanner message={error} onRetry={refetch} />}
      {!loading && !error && recipes && recipes.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No recipes match"
          description="Try a different search term or clear the cuisine filter."
        />
      )}
      {!loading && !error && recipes && recipes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}
