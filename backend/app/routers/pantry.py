from collections import defaultdict

from fastapi import APIRouter
from pydantic import BaseModel

from app import queries
from app.db import run_query
from app.models import IngredientBrief, PantryMatch, SubstitutionEdge

router = APIRouter(prefix="/api/pantry", tags=["pantry"])


class PantryRequest(BaseModel):
    ingredient_ids: list[str]


@router.post("/match", response_model=list[PantryMatch])
def match_pantry(payload: PantryRequest, limit: int = 20) -> list[PantryMatch]:
    """
    "What can I almost cook?" — a recipe qualifies if every non-optional
    ingredient it needs is either directly in the pantry, or reachable from
    the pantry through a short chain of substitutions (see
    queries.PANTRY_BRIDGES). Two flat, parameterized Cypher queries fetch the
    raw need/bridge facts; the set-covering logic itself runs here in Python
    so it stays easy to follow and adjust.
    """
    pantry_ids = set(payload.ingredient_ids)
    if not pantry_ids:
        return []

    needs_rows = run_query(queries.PANTRY_ALL_NEEDS)
    bridge_rows = run_query(queries.PANTRY_BRIDGES, {"pantry_ids": list(pantry_ids)})

    bridges = {(row["recipe_id"], row["ingredient_id"]): row for row in bridge_rows}

    recipes: dict[str, dict] = {}
    needs_by_recipe: dict[str, list[dict]] = defaultdict(list)
    for row in needs_rows:
        rid = row["recipe_id"]
        recipes[rid] = {
            "id": rid,
            "name": row["recipe_name"],
            "cuisine": row["cuisine"],
            "prep_minutes": row["prep_minutes"],
            "servings": row["servings"],
            "image_url": row["image_url"],
        }
        needs_by_recipe[rid].append(row)

    results: list[PantryMatch] = []
    for rid, needs in needs_by_recipe.items():
        have_directly: list[IngredientBrief] = []
        have_via_substitution: list[SubstitutionEdge] = []
        missing: list[IngredientBrief] = []

        for need in needs:
            ingredient = IngredientBrief(
                id=need["ingredient_id"],
                name=need["ingredient_name"],
                category=need["ingredient_category"],
            )
            if need["ingredient_id"] in pantry_ids:
                have_directly.append(ingredient)
                continue

            bridge = bridges.get((rid, need["ingredient_id"]))
            if bridge:
                names = bridge["bridge_names"]
                have_via_substitution.append(
                    SubstitutionEdge(from_name=names[-1], to_name=names[0])
                )
                continue

            if need["optional"]:
                continue

            missing.append(ingredient)

        if missing:
            continue

        results.append(
            PantryMatch(
                recipe=recipes[rid],
                have_directly=have_directly,
                have_via_substitution=have_via_substitution,
                missing=[],
            )
        )

    results.sort(key=lambda m: (len(m.have_via_substitution), m.recipe.name))
    return results[:limit]
