import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Ban, FlaskConical, UtensilsCrossed } from "lucide-react";
import { api, ApiError } from "../api/client";
import { useApi } from "../lib/useApi";
import { LoadingState, ErrorBanner, EmptyState } from "../components/states";
import { IngredientPicker } from "../components/IngredientPicker";
import type {
  IngredientBrief,
  IngredientDetail as IngredientDetailType,
  PairingSuggestion,
  SubstitutionPath,
} from "../types";

export function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    data: ingredient,
    loading,
    error,
    refetch,
  } = useApi<IngredientDetailType>(() => api.getIngredient(id!), [id]);
  const { data: pairings } = useApi<PairingSuggestion[]>(() => api.getPairings(id!), [id]);

  if (loading) return <LoadingState label="Loading ingredient…" />;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorBanner message={error} onRetry={refetch} />
      </div>
    );
  if (!ingredient) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="focus-ring inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-terracotta-dark hover:underline"
      >
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
        Back to recipes
      </Link>

      <div className="mt-4">
        <h1 className="font-display text-2xl font-semibold text-ink">{ingredient.name}</h1>
        <p className="mt-1 text-sm capitalize text-muted">{ingredient.category}</p>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-ink">Used in</h2>
        {ingredient.used_in.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="Not used in any recipe yet" />
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ingredient.used_in.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/recipes/${r.id}`}
                  className="focus-ring block rounded-xl border border-sand bg-white/60 px-4 py-2.5 text-sm text-ink-soft transition hover:border-terracotta hover:text-terracotta-dark"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium text-ink">Pairs well with</h2>
        <p className="mt-1 text-sm text-muted">
          Ranked by the number of shared flavor compounds, from published flavor-pairing research.
        </p>
        {pairings && pairings.length === 0 && (
          <EmptyState icon={FlaskConical} title="No flavor-compound data for this ingredient yet" />
        )}
        {pairings && pairings.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {pairings.map((p) => (
              <li key={p.ingredient.id}>
                <Link
                  to={`/ingredients/${p.ingredient.id}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-sand bg-white/60 px-3 py-1.5 text-sm text-ink-soft transition hover:border-terracotta hover:text-terracotta-dark"
                >
                  {p.ingredient.name}
                  <span className="text-xs text-muted">×{p.shared_compounds}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SubstitutionPathFinder fromId={ingredient.id} fromName={ingredient.name} />
    </div>
  );
}

function SubstitutionPathFinder({ fromId, fromName }: { fromId: string; fromName: string }) {
  const [target, setTarget] = useState<IngredientBrief | null>(null);
  const [path, setPath] = useState<SubstitutionPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function findPath(target: IngredientBrief) {
    setTarget(target);
    setLoading(true);
    setError(null);
    setPath(null);
    try {
      const result = await api.getSubstitutionPath(fromId, target.id);
      setPath(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-sand bg-cream-dim p-5">
      <h2 className="font-display text-lg font-medium text-ink">Find a substitution path</h2>
      <p className="mt-1 text-sm text-muted">
        See how {fromName} connects to another ingredient through a chain of substitutions.
      </p>
      <div className="mt-3 max-w-sm">
        <label className="sr-only" htmlFor="substitution-target">
          Search for an ingredient to find a substitution path to
        </label>
        <IngredientPicker
          id="substitution-target"
          placeholder="Search for an ingredient…"
          excludeIds={[fromId]}
          onSelect={findPath}
        />
      </div>

      {loading && <LoadingState label="Searching for a path…" />}
      {!loading && error && <ErrorBanner message={error} />}
      {!loading && !error && target && path && !path.found && (
        <EmptyState
          icon={Ban}
          title={`No substitution path found to ${target.name}`}
          description="These ingredients aren't connected within 6 substitution hops."
        />
      )}
      {!loading && path?.found && (
        <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <li className="rounded-full bg-terracotta px-3 py-1.5 font-medium text-cream">{fromName}</li>
          {path.steps.map((step, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-muted" aria-hidden="true">
                <ArrowRight size={14} strokeWidth={2} />
                {step.ratio && <span className="text-xs">{step.ratio}</span>}
              </span>
              <span className="rounded-full bg-olive/15 px-3 py-1.5 font-medium text-olive-dark">
                {step.to_name}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
