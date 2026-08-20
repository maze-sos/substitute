from fastapi import APIRouter, HTTPException, Query

from app import queries
from app.db import run_query
from app.models import RecipeBrief, RecipeDetail, RecipeWithScore

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeBrief])
def list_recipes(
    search: str = Query(default=""),
    cuisine: str = Query(default=""),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=24, ge=1, le=100),
) -> list[RecipeBrief]:
    rows = run_query(
        queries.RECIPE_LIST,
        {"search": search, "cuisine": cuisine, "skip": skip, "limit": limit},
    )
    return [RecipeBrief(**row) for row in rows]


@router.get("/cuisines", response_model=list[str])
def list_cuisines() -> list[str]:
    rows = run_query(queries.CUISINE_LIST)
    return [row["name"] for row in rows]


@router.get("/{recipe_id}", response_model=RecipeDetail)
def get_recipe(recipe_id: str) -> RecipeDetail:
    rows = run_query(queries.RECIPE_DETAIL, {"recipe_id": recipe_id})
    if not rows or rows[0]["id"] is None:
        raise HTTPException(status_code=404, detail="Recipe not found.")
    row = rows[0]
    ingredients = [ing for ing in row["ingredients"] if ing["id"] is not None]
    return RecipeDetail(
        id=row["id"],
        name=row["name"],
        cuisine=row["cuisine"],
        prep_minutes=row["prep_minutes"],
        servings=row["servings"],
        image_url=row["image_url"],
        instructions=row["instructions"],
        tags=[t for t in row["tags"] if t is not None],
        ingredients=[
            {
                "ingredient": {"id": ing["id"], "name": ing["name"], "category": ing["category"]},
                "quantity": ing["quantity"],
                "unit": ing["unit"],
                "optional": ing["optional"],
            }
            for ing in ingredients
        ],
    )


@router.get("/{recipe_id}/similar", response_model=list[RecipeWithScore])
def get_similar_recipes(recipe_id: str, limit: int = Query(default=6, ge=1, le=24)) -> list[RecipeWithScore]:
    rows = run_query(queries.SIMILAR_RECIPES, {"recipe_id": recipe_id, "limit": limit})
    return [RecipeWithScore(**row) for row in rows]
