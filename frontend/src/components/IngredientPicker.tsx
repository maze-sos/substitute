import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { IngredientBrief } from "../types";

interface Props {
  placeholder?: string;
  excludeIds?: string[];
  onSelect: (ingredient: IngredientBrief) => void;
}

export function IngredientPicker({ placeholder = "Search ingredients…", excludeIds = [], onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IngredientBrief[]>([]);
  const [open, setOpen] = useState(false);

  // Callers (Pantry, IngredientDetail) pass a fresh excludeIds array every
  // render, which would otherwise re-fire this debounce on every parent
  // re-render. A ref lets the effect read the latest value without
  // depending on array identity.
  const excludeIdsRef = useRef(excludeIds);
  excludeIdsRef.current = excludeIds;

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      api
        .listIngredients({ search: query, limit: 8 })
        .then((res) => {
          if (!cancelled) setResults(res.filter((i) => !excludeIdsRef.current.includes(i.id)));
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-full border border-sand-dark bg-white/70 px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-terracotta focus:outline-none"
      />
      {open && results.length > 0 && (
        <ul
          data-testid="ingredient-picker-results"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-sand bg-white shadow-lg"
        >
          {results.map((ing) => (
            <li key={ing.id}>
              <button
                type="button"
                data-testid="ingredient-picker-option"
                onMouseDown={() => {
                  onSelect(ing);
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-ink-soft hover:bg-cream-dim"
              >
                <span>{ing.name}</span>
                <span className="text-xs capitalize text-muted">{ing.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
