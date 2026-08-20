from pydantic import BaseModel


class IngredientBrief(BaseModel):
    id: str
    name: str
    category: str


class RecipeBrief(BaseModel):
    id: str
    name: str
    cuisine: str | None = None
    prep_minutes: int | None = None
    servings: int | None = None
    image_url: str | None = None


class IngredientUse(BaseModel):
    ingredient: IngredientBrief
    quantity: str | None = None
    unit: str | None = None
    optional: bool = False


class RecipeDetail(RecipeBrief):
    instructions: str
    tags: list[str] = []
    ingredients: list[IngredientUse] = []


class RecipeWithScore(RecipeBrief):
    shared_ingredients: int


class IngredientDetail(IngredientBrief):
    tags: list[str] = []
    used_in: list[RecipeBrief] = []


class PairingSuggestion(BaseModel):
    ingredient: IngredientBrief
    shared_compounds: int


class SubstitutionEdge(BaseModel):
    from_name: str
    to_name: str
    ratio: str | None = None
    note: str | None = None


class SubstitutionPath(BaseModel):
    found: bool
    steps: list[SubstitutionEdge] = []


class PantryMatch(BaseModel):
    recipe: RecipeBrief
    have_directly: list[IngredientBrief]
    have_via_substitution: list[SubstitutionEdge]
    missing: list[IngredientBrief]
