# Centralized, parameterized Cypher. Every query here is executed via the
# neo4j driver's parameter binding (see app/db.py::run_query) — no string
# concatenation of user input into Cypher, ever.

# Filters by traversing BELONGS_TO rather than comparing the flat
# r.cuisine slug directly, so the relationship modeled for this purpose
# is the thing actually doing the filtering.
RECIPE_LIST = """
MATCH (r:Recipe)-[:BELONGS_TO]->(cu:Cuisine)
WHERE ($search = '' OR toLower(r.name) CONTAINS toLower($search))
  AND ($cuisine = '' OR cu.id = $cuisine)
RETURN r.id AS id, r.name AS name, cu.id AS cuisine,
       r.prep_minutes AS prep_minutes, r.servings AS servings, r.image_url AS image_url
ORDER BY r.name
SKIP $skip LIMIT $limit
"""

CUISINE_LIST = """
MATCH (c:Cuisine)
RETURN c.id AS id, c.name AS name
ORDER BY c.name
"""

# Recipe detail: pulls ingredients (with quantity/unit/optional-flag properties
# from the USES relationship) and dietary tags in two separate traversal
# stages to avoid a cartesian blow-up between the two OPTIONAL MATCHes.
RECIPE_DETAIL = """
MATCH (r:Recipe {id: $recipe_id})
OPTIONAL MATCH (r)-[u:USES]->(ing:Ingredient)
WITH r, collect(DISTINCT {
    id: ing.id, name: ing.name, category: ing.category,
    quantity: u.quantity, unit: u.unit, optional: coalesce(u.optional, false)
}) AS ingredients
OPTIONAL MATCH (r)-[:HAS_TAG]->(t:DietaryTag)
RETURN r.id AS id, r.name AS name, r.cuisine AS cuisine, r.prep_minutes AS prep_minutes,
       r.servings AS servings, r.image_url AS image_url, r.instructions AS instructions,
       ingredients, collect(DISTINCT t.name) AS tags
"""

# 2-hop traversal: Recipe -> Ingredient <- Recipe, ranked by shared ingredient count.
# A relational equivalent needs a self-join through a bridge table plus a
# GROUP BY/HAVING just to answer "recipes like this one" — here it's one pattern.
SIMILAR_RECIPES = """
MATCH (r:Recipe {id: $recipe_id})-[:USES]->(ing:Ingredient)<-[:USES]-(other:Recipe)
WHERE other.id <> $recipe_id
WITH other, count(DISTINCT ing) AS shared_ingredients
ORDER BY shared_ingredients DESC, other.name ASC
LIMIT $limit
RETURN other.id AS id, other.name AS name, other.cuisine AS cuisine,
       other.prep_minutes AS prep_minutes, other.servings AS servings,
       other.image_url AS image_url, shared_ingredients
"""

INGREDIENT_LIST = """
MATCH (i:Ingredient)
WHERE $search = '' OR toLower(i.name) CONTAINS toLower($search)
RETURN i.id AS id, i.name AS name, i.category AS category
ORDER BY i.name
LIMIT $limit
"""

INGREDIENT_DETAIL = """
MATCH (i:Ingredient {id: $ingredient_id})
OPTIONAL MATCH (i)-[:HAS_TAG]->(t:DietaryTag)
WITH i, collect(DISTINCT t.name) AS tags
OPTIONAL MATCH (r:Recipe)-[:USES]->(i)
RETURN i.id AS id, i.name AS name, i.category AS category, tags,
       collect(DISTINCT {
           id: r.id, name: r.name, cuisine: r.cuisine,
           prep_minutes: r.prep_minutes, servings: r.servings, image_url: r.image_url
       }) AS used_in
"""

# 2-hop traversal: Ingredient -> FlavorCompound <- Ingredient, ranked by shared
# compound count. There is no clean relational shape for "things connected
# through an arbitrary number of shared many-to-many attributes, ranked" —
# it's either a wide pivot table or a chain of self-joins per compound.
PAIRING_SUGGESTIONS = """
MATCH (i:Ingredient {id: $ingredient_id})-[:CONTAINS_COMPOUND]->(c:FlavorCompound)
      <-[:CONTAINS_COMPOUND]-(other:Ingredient)
WHERE other.id <> $ingredient_id
WITH other, count(DISTINCT c) AS shared_compounds
ORDER BY shared_compounds DESC, other.name ASC
LIMIT $limit
RETURN other.id AS id, other.name AS name, other.category AS category, shared_compounds
"""

# Variable-length shortest path over SUBSTITUTES_FOR — the flagship
# "how do I get from X to Y" query. Unbounded-depth reachability like this is
# exactly what recursive CTEs simulate poorly and graphs do natively.
SUBSTITUTION_PATH = """
MATCH (a:Ingredient {id: $from_id}), (b:Ingredient {id: $to_id})
OPTIONAL MATCH path = shortestPath((a)-[:SUBSTITUTES_FOR*..6]-(b))
RETURN
    [n IN nodes(path) | {id: n.id, name: n.name}] AS path_nodes,
    [rel IN relationships(path) | {ratio: rel.ratio, note: rel.note}] AS path_rels
"""

# Every non-optional-flagged (recipe, ingredient) pairing in the graph. Used
# by the pantry ("what can I almost cook") feature as the base need-set.
PANTRY_ALL_NEEDS = """
MATCH (r:Recipe)-[u:USES]->(ing:Ingredient)
RETURN r.id AS recipe_id, r.name AS recipe_name, r.cuisine AS cuisine,
       r.prep_minutes AS prep_minutes, r.servings AS servings, r.image_url AS image_url,
       ing.id AS ingredient_id, ing.name AS ingredient_name,
       ing.category AS ingredient_category, coalesce(u.optional, false) AS optional
"""

# For every needed ingredient the pantry doesn't directly contain, find the
# shortest substitution bridge (<= 2 hops) from something the pantry does
# contain. This is the "SQL would find this awkward" query: it's a
# reachability search over a self-referential many-to-many edge, not a lookup.
PANTRY_BRIDGES = """
MATCH (needed:Ingredient)<-[:USES]-(r:Recipe)
WHERE NOT needed.id IN $pantry_ids
OPTIONAL MATCH bridge = shortestPath((needed)-[:SUBSTITUTES_FOR*1..2]-(pantry:Ingredient))
WHERE pantry.id IN $pantry_ids
WITH r, needed, bridge
WHERE bridge IS NOT NULL
RETURN r.id AS recipe_id, needed.id AS ingredient_id, needed.name AS ingredient_name,
       [n IN nodes(bridge) | n.name] AS bridge_names, length(bridge) AS hops
"""
