import type {
  IngredientBrief,
  IngredientDetail,
  PairingSuggestion,
  PantryMatch,
  RecipeBrief,
  RecipeDetail,
  RecipeWithScore,
  SubstitutionPath,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.detail ??
      (response.status === 503
        ? "The database is currently unreachable. Please try again shortly."
        : `Request failed (${response.status}).`);
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; database: string }>("/api/health"),

  listRecipes: (params: { search?: string; cuisine?: string; skip?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.cuisine) qs.set("cuisine", params.cuisine);
    if (params.skip !== undefined) qs.set("skip", String(params.skip));
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<RecipeBrief[]>(`/api/recipes${suffix}`);
  },

  listCuisines: () => request<string[]>("/api/recipes/cuisines"),

  listIngredients: (params: { search?: string; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<IngredientBrief[]>(`/api/ingredients${suffix}`);
  },

  getRecipe: (id: string) => request<RecipeDetail>(`/api/recipes/${encodeURIComponent(id)}`),

  getSimilarRecipes: (id: string) =>
    request<RecipeWithScore[]>(`/api/recipes/${encodeURIComponent(id)}/similar`),

  getIngredient: (id: string) =>
    request<IngredientDetail>(`/api/ingredients/${encodeURIComponent(id)}`),

  getPairings: (id: string) =>
    request<PairingSuggestion[]>(`/api/ingredients/${encodeURIComponent(id)}/pairings`),

  getSubstitutionPath: (fromId: string, toId: string) =>
    request<SubstitutionPath>(
      `/api/ingredients/${encodeURIComponent(fromId)}/substitution-path/${encodeURIComponent(toId)}`,
    ),

  matchPantry: (ingredientIds: string[]) =>
    request<PantryMatch[]>("/api/pantry/match", {
      method: "POST",
      body: JSON.stringify({ ingredient_ids: ingredientIds }),
    }),
};
