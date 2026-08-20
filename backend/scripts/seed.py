"""
Loads the seed dataset (backend/data/*.json) into CognoDB.

Idempotent: every write uses MERGE keyed on a stable `id`, so re-running this
script updates properties in place instead of creating duplicates. Safe to
run repeatedly while iterating on the dataset.

Usage:
    cd backend
    python -m scripts.seed
"""

import json
import sys
from pathlib import Path

from neo4j import GraphDatabase

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import settings  # noqa: E402

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_json(name: str):
    with open(DATA_DIR / name, encoding="utf-8") as f:
        return json.load(f)


CONSTRAINTS = [
    "CREATE CONSTRAINT recipe_id IF NOT EXISTS FOR (r:Recipe) REQUIRE r.id IS UNIQUE",
    "CREATE CONSTRAINT ingredient_id IF NOT EXISTS FOR (i:Ingredient) REQUIRE i.id IS UNIQUE",
    "CREATE CONSTRAINT compound_id IF NOT EXISTS FOR (c:FlavorCompound) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT cuisine_id IF NOT EXISTS FOR (c:Cuisine) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT tag_id IF NOT EXISTS FOR (t:DietaryTag) REQUIRE t.id IS UNIQUE",
]

LOAD_CUISINES = """
UNWIND $rows AS row
MERGE (c:Cuisine {id: row.id})
SET c.name = row.name
"""

LOAD_TAGS = """
UNWIND $rows AS row
MERGE (t:DietaryTag {id: row.id})
SET t.name = row.name
"""

LOAD_INGREDIENTS = """
UNWIND $rows AS row
MERGE (i:Ingredient {id: row.id})
SET i.name = row.name, i.category = row.category
"""

LOAD_COMPOUNDS = """
UNWIND $rows AS row
MERGE (c:FlavorCompound {id: row.id})
SET c.name = row.name
"""

LOAD_INGREDIENT_COMPOUNDS = """
UNWIND $rows AS row
MATCH (i:Ingredient {id: row.ingredient_id})
MATCH (c:FlavorCompound {id: row.compound_id})
MERGE (i)-[:CONTAINS_COMPOUND]->(c)
"""

LOAD_SUBSTITUTIONS = """
UNWIND $rows AS row
MATCH (a:Ingredient {id: row.from_id})
MATCH (b:Ingredient {id: row.to_id})
MERGE (a)-[s:SUBSTITUTES_FOR]->(b)
SET s.ratio = row.ratio, s.note = row.note
"""

LOAD_RECIPES = """
UNWIND $rows AS row
MERGE (r:Recipe {id: row.id})
SET r.name = row.name, r.instructions = row.instructions,
    r.cuisine = row.cuisine, r.prep_minutes = row.prep_minutes,
    r.servings = row.servings, r.image_url = row.image_url
WITH r, row
MATCH (c:Cuisine {id: row.cuisine})
MERGE (r)-[:BELONGS_TO]->(c)
"""

LOAD_RECIPE_TAGS = """
UNWIND $rows AS row
MATCH (r:Recipe {id: row.recipe_id})
MATCH (t:DietaryTag {id: row.tag_id})
MERGE (r)-[:HAS_TAG]->(t)
"""

LOAD_RECIPE_INGREDIENTS = """
UNWIND $rows AS row
MATCH (r:Recipe {id: row.recipe_id})
MATCH (i:Ingredient {id: row.ingredient_id})
MERGE (r)-[u:USES]->(i)
SET u.quantity = row.quantity, u.unit = row.unit, u.optional = row.optional
"""


def run(driver, query: str, rows) -> None:
    with driver.session() as session:
        session.run(query, rows=rows)


def main() -> None:
    ingredients = load_json("ingredients.json")
    compounds = load_json("compounds.json")
    cuisines = load_json("cuisines.json")
    tags = load_json("tags.json")
    ingredient_compounds = load_json("ingredient_compounds.json")
    substitutions = load_json("substitutions.json")
    recipes = load_json("recipes.json")

    recipe_tag_rows = [
        {"recipe_id": r["id"], "tag_id": tag_id}
        for r in recipes
        for tag_id in r.get("tags", [])
    ]
    recipe_ingredient_rows = [
        {
            "recipe_id": r["id"],
            "ingredient_id": ing["ingredient_id"],
            "quantity": ing.get("quantity"),
            "unit": ing.get("unit"),
            "optional": ing.get("optional", False),
        }
        for r in recipes
        for ing in r["ingredients"]
    ]

    driver = GraphDatabase.driver(settings.bolt_uri, auth=(settings.bolt_user, settings.bolt_password))
    try:
        driver.verify_connectivity()
        print("Connected to CognoDB.")

        with driver.session() as session:
            for constraint in CONSTRAINTS:
                session.run(constraint)
        print("Constraints ensured.")

        run(driver, LOAD_CUISINES, cuisines)
        print(f"Loaded {len(cuisines)} cuisines.")

        run(driver, LOAD_TAGS, tags)
        print(f"Loaded {len(tags)} dietary tags.")

        run(driver, LOAD_INGREDIENTS, ingredients)
        print(f"Loaded {len(ingredients)} ingredients.")

        run(driver, LOAD_COMPOUNDS, compounds)
        print(f"Loaded {len(compounds)} flavor compounds.")

        run(driver, LOAD_INGREDIENT_COMPOUNDS, ingredient_compounds)
        print(f"Loaded {len(ingredient_compounds)} ingredient-compound links.")

        run(driver, LOAD_SUBSTITUTIONS, substitutions)
        print(f"Loaded {len(substitutions)} substitution edges.")

        run(driver, LOAD_RECIPES, recipes)
        print(f"Loaded {len(recipes)} recipes (+ BELONGS_TO Cuisine).")

        run(driver, LOAD_RECIPE_TAGS, recipe_tag_rows)
        print(f"Loaded {len(recipe_tag_rows)} recipe-tag links.")

        run(driver, LOAD_RECIPE_INGREDIENTS, recipe_ingredient_rows)
        print(f"Loaded {len(recipe_ingredient_rows)} recipe-ingredient (USES) links.")

        print("Seeding complete.")
    finally:
        driver.close()


if __name__ == "__main__":
    main()
