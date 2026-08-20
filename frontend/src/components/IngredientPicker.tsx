import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { api } from "../api/client";
import type { IngredientBrief } from "../types";

interface Props {
  id?: string;
  placeholder?: string;
  excludeIds?: string[];
  onSelect: (ingredient: IngredientBrief) => void;
}

export function IngredientPicker({ id, placeholder = "Search ingredients…", excludeIds = [], onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IngredientBrief[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

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
          if (!cancelled) {
            setResults(res.filter((i) => !excludeIdsRef.current.includes(i.id)));
            setActiveIndex(-1);
          }
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

  function select(ingredient: IngredientBrief) {
    onSelect(ingredient);
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const listboxId = id ? `${id}-listbox` : undefined;

  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        size={16}
        strokeWidth={2}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="form-control focus-ring w-full pl-10"
      />
      {open && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          data-testid="ingredient-picker-results"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-sand bg-white shadow-lg"
        >
          {results.map((ing, i) => (
            <li key={ing.id} role="presentation">
              <button
                type="button"
                id={`${listboxId}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                data-testid="ingredient-picker-option"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={() => select(ing)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm text-ink-soft ${
                  i === activeIndex ? "bg-cream-dim" : ""
                }`}
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
