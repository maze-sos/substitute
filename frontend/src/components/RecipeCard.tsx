import { Link } from "react-router-dom";
import type { RecipeBrief } from "../types";
import { RecipePlaceholderArt } from "./RecipePlaceholderArt";
import { formatCuisineName } from "../lib/cuisineTheme";

interface Props {
  recipe: RecipeBrief;
  badge?: string;
}

export function RecipeCard({ recipe, badge }: Props) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white/60 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <RecipePlaceholderArt cuisine={recipe.cuisine} className="h-36 w-full" />
        {badge && (
          <span className="absolute right-2 top-2 rounded-full bg-cream/90 px-2.5 py-1 text-xs font-medium text-ink-soft shadow-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-base font-medium text-ink group-hover:text-terracotta-dark">
          {recipe.name}
        </h3>
        <div className="mt-auto flex items-center gap-2 text-xs text-muted">
          <span>{formatCuisineName(recipe.cuisine)}</span>
          {recipe.prep_minutes && (
            <>
              <span aria-hidden="true">·</span>
              <span>{recipe.prep_minutes} min</span>
            </>
          )}
          {recipe.servings && (
            <>
              <span aria-hidden="true">·</span>
              <span>serves {recipe.servings}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
