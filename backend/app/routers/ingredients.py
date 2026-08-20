from fastapi import APIRouter, HTTPException, Query

from app import queries
from app.db import run_query
from app.models import (
    IngredientBrief,
    IngredientDetail,
    PairingSuggestion,
    SubstitutionEdge,
    SubstitutionPath,
)

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


@router.get("", response_model=list[IngredientBrief])
def list_ingredients(
    search: str = Query(default=""), limit: int = Query(default=30, ge=1, le=100)
) -> list[IngredientBrief]:
    rows = run_query(queries.INGREDIENT_LIST, {"search": search, "limit": limit})
    return [IngredientBrief(**row) for row in rows]


@router.get("/{ingredient_id}", response_model=IngredientDetail)
def get_ingredient(ingredient_id: str) -> IngredientDetail:
    rows = run_query(queries.INGREDIENT_DETAIL, {"ingredient_id": ingredient_id})
    if not rows or rows[0]["id"] is None:
        raise HTTPException(status_code=404, detail="Ingredient not found.")
    row = rows[0]
    used_in = [r for r in row["used_in"] if r["id"] is not None]
    return IngredientDetail(
        id=row["id"],
        name=row["name"],
        category=row["category"],
        tags=[t for t in row["tags"] if t is not None],
        used_in=used_in,
    )


@router.get("/{ingredient_id}/pairings", response_model=list[PairingSuggestion])
def get_pairings(ingredient_id: str, limit: int = Query(default=8, ge=1, le=24)) -> list[PairingSuggestion]:
    rows = run_query(queries.PAIRING_SUGGESTIONS, {"ingredient_id": ingredient_id, "limit": limit})
    return [
        PairingSuggestion(
            ingredient={"id": row["id"], "name": row["name"], "category": row["category"]},
            shared_compounds=row["shared_compounds"],
        )
        for row in rows
    ]


@router.get("/{from_id}/substitution-path/{to_id}", response_model=SubstitutionPath)
def get_substitution_path(from_id: str, to_id: str) -> SubstitutionPath:
    rows = run_query(queries.SUBSTITUTION_PATH, {"from_id": from_id, "to_id": to_id})
    nodes = rows[0]["path_nodes"] if rows else None
    rels = rows[0]["path_rels"] if rows else None
    if not nodes:
        return SubstitutionPath(found=False)
    steps = [
        SubstitutionEdge(
            from_name=nodes[i]["name"],
            to_name=nodes[i + 1]["name"],
            ratio=rels[i]["ratio"],
            note=rels[i]["note"],
        )
        for i in range(len(rels))
    ]
    return SubstitutionPath(found=True, steps=steps)
