export interface IngredientBrief {
  id: string;
  name: string;
  category: string;
}

export interface RecipeBrief {
  id: string;
  name: string;
  cuisine: string | null;
  prep_minutes: number | null;
  servings: number | null;
  image_url: string | null;
}

export interface RecipeWithScore extends RecipeBrief {
  shared_ingredients: number;
}

export interface IngredientUse {
  ingredient: IngredientBrief;
  quantity: string | null;
  unit: string | null;
  optional: boolean;
}

export interface RecipeDetail extends RecipeBrief {
  instructions: string;
  tags: string[];
  ingredients: IngredientUse[];
}

export interface IngredientDetail extends IngredientBrief {
  tags: string[];
  used_in: RecipeBrief[];
}

export interface PairingSuggestion {
  ingredient: IngredientBrief;
  shared_compounds: number;
}

export interface SubstitutionEdge {
  from_name: string;
  to_name: string;
  ratio: string | null;
  note: string | null;
}

export interface SubstitutionPath {
  found: boolean;
  steps: SubstitutionEdge[];
}

export interface PantryMatch {
  recipe: RecipeBrief;
  have_directly: IngredientBrief[];
  have_via_substitution: SubstitutionEdge[];
  missing: IngredientBrief[];
}
