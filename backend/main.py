"""
PrepFast Backend API Service
FastAPI service for recipe web scraping, intelligent ingredient parsing,
and unit-normalized grocery list aggregation with pantry inventory deduction.
"""

import json
import logging
import re
from fractions import Fraction
from typing import Dict, List, Optional
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("prepfast-backend")

app = FastAPI(
    title="PrepFast Recipe & Grocery Engine",
    description="Intelligent recipe scraper, ingredient normalizer, and grocery list aggregator",
    version="1.0.0",
)

# Enable CORS for Next.js frontend (local development and cloud deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# Pydantic Schemas
# ==============================================================================

class IngredientItem(BaseModel):
    name: str
    amount: float = 1.0
    unit: str = ""
    category: str = "Other"
    raw_text: Optional[str] = None


class RecipeParseRequest(BaseModel):
    url: str = Field(..., description="Target recipe URL to scrape and parse")


class RecipeResponse(BaseModel):
    title: str
    source_url: str
    image_url: Optional[str] = None
    prep_time_mins: int = 30
    servings: int = 4
    tags: List[str] = []
    ingredients: List[IngredientItem] = []
    instructions: List[str] = []


class PantryItem(BaseModel):
    item_name: str
    amount: float = 0.0
    unit: str = ""
    category: Optional[str] = "Pantry"


class MealPlanItem(BaseModel):
    recipe_id: Optional[str] = None
    recipe_title: str
    servings_scaled: int = 4
    base_servings: int = 4
    ingredients: List[IngredientItem]


class AggregateGroceryRequest(BaseModel):
    meal_plans: List[MealPlanItem]
    pantry_items: List[PantryItem] = []
    deduct_pantry: bool = True


class AggregatedGroceryItem(BaseModel):
    name: str
    original_needed: float
    pantry_stock: float
    net_needed: float
    unit: str
    category: str
    recipes: List[str] = []
    checked: bool = False


class AisleGroup(BaseModel):
    category: str
    count: int
    items: List[AggregatedGroceryItem]


class GroceryListResponse(BaseModel):
    total_items_count: int
    aisles: List[AisleGroup]


# ==============================================================================
# Ingredient Parsing & Normalization Logic
# ==============================================================================

UNICODE_FRACTIONS = {
    "¼": 0.25,
    "½": 0.5,
    "¾": 0.75,
    "⅓": 0.333,
    "⅔": 0.666,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875,
}

UNIT_MAP = {
    # Volume - small
    "tsp": "tsp",
    "tsps": "tsp",
    "teaspoon": "tsp",
    "teaspoons": "tsp",
    "t": "tsp",
    "tbsp": "tbsp",
    "tbsps": "tbsp",
    "tablespoon": "tbsp",
    "tablespoons": "tbsp",
    "tbs": "tbsp",
    "tb": "tbsp",
    "T": "tbsp",
    # Volume - large
    "cup": "cup",
    "cups": "cup",
    "c": "cup",
    "pint": "pint",
    "pints": "pint",
    "pt": "pint",
    "quart": "quart",
    "quarts": "quart",
    "qt": "quart",
    "gallon": "gallon",
    "gallons": "gallon",
    "gal": "gallon",
    "ml": "ml",
    "milliliter": "ml",
    "milliliters": "ml",
    "l": "l",
    "liter": "l",
    "liters": "l",
    "fl oz": "fl oz",
    "fluid ounce": "fl oz",
    "fluid ounces": "fl oz",
    # Weight
    "oz": "oz",
    "ozs": "oz",
    "ounce": "oz",
    "ounces": "oz",
    "lb": "lb",
    "lbs": "lb",
    "pound": "lb",
    "pounds": "lb",
    "g": "g",
    "gram": "g",
    "grams": "g",
    "kg": "kg",
    "kilogram": "kg",
    "kilograms": "kg",
    # Count / Items
    "clove": "clove",
    "cloves": "clove",
    "can": "can",
    "cans": "can",
    "stalk": "stalk",
    "stalks": "stalk",
    "slice": "slice",
    "slices": "slice",
    "fillet": "fillet",
    "fillets": "fillet",
    "bunch": "bunch",
    "bunches": "bunch",
    "head": "head",
    "heads": "head",
    "pinch": "pinch",
    "pinches": "pinch",
    "dash": "dash",
    "package": "package",
    "packages": "package",
    "pkg": "package",
    "piece": "piece",
    "pieces": "piece",
    "whole": "whole",
}

CATEGORY_KEYWORDS = {
    "Produce": [
        "garlic", "onion", "lemon", "lime", "tomato", "potato", "spinach", "kale",
        "carrot", "celery", "cilantro", "parsley", "dill", "basil", "mushroom",
        "pepper", "lettuce", "apple", "banana", "ginger", "berry", "berries",
        "blueberry", "strawberry", "avocado", "zucchini", "cucumber", "broccoli",
        "cauliflower", "cabbage", "asparagus", "rosemary", "thyme", "scallion",
        "shallot", "mint", "arugula", "sweet potato", "squash"
    ],
    "Dairy": [
        "milk", "butter", "cheese", "cream", "heavy cream", "yogurt", "parmesan",
        "cheddar", "mozzarella", "sour cream", "egg", "eggs", "feta", "ricotta",
        "almond milk", "oat milk", "ghee", "half and half"
    ],
    "Meat": [
        "chicken", "beef", "pork", "salmon", "fish", "turkey", "shrimp", "bacon",
        "sausage", "steak", "tuna", "lamb", "ground beef", "chicken breast",
        "prosciutto", "ham", "cod", "tilapia", "prawn"
    ],
    "Pantry": [
        "olive oil", "vegetable oil", "oil", "flour", "sugar", "brown sugar",
        "rice", "quinoa", "pasta", "beans", "black beans", "chickpeas", "broth",
        "chicken broth", "vegetable broth", "vinegar", "balsamic", "oats",
        "rolled oats", "soy sauce", "tahini", "cornstarch", "maple syrup", "honey",
        "coconut milk", "baking powder", "baking soda", "chia", "chia seeds",
        "yeast", "peanut butter", "almond butter", "mustard", "mayonnaise",
        "canned tomato", "sun-dried tomato", "protein powder"
    ],
    "Spices": [
        "salt", "sea salt", "pepper", "black pepper", "cumin", "oregano", "paprika",
        "smoked paprika", "chili powder", "cinnamon", "nutmeg", "curry powder",
        "bay leaf", "coriander", "turmeric", "cayenne", "red pepper flakes",
        "cardamom", "cloves powder", "garlic powder", "onion powder", "italian seasoning"
    ],
    "Frozen": [
        "frozen peas", "frozen corn", "ice cream", "frozen berries", "frozen spinach"
    ],
    "Bakery": [
        "bread", "bun", "buns", "tortilla", "tortillas", "pita", "bagel", "croissant"
    ],
    "Beverages": [
        "coffee", "tea", "wine", "white wine", "red wine", "juice", "lemon juice"
    ],
}


def categorize_ingredient(name: str) -> str:
    """Classifies ingredient into supermarket aisle categories based on keywords."""
    lowered = name.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            # Match word boundary or stemmed keyword with plural tolerance
            kw_stem = kw.rstrip("s")
            if re.search(r"\b" + re.escape(kw_stem), lowered):
                return category
    return "Other"


def parse_fraction(text: str) -> float:
    """Converts fraction strings ('1 1/2', '3/4', '½') to float."""
    text = text.strip()
    for char, val in UNICODE_FRACTIONS.items():
        if char in text:
            parts = text.split(char)
            base = float(parts[0].strip()) if parts[0].strip() else 0.0
            return base + val

    if "/" in text:
        try:
            parts = text.split()
            if len(parts) == 2:
                return float(parts[0]) + float(Fraction(parts[1]))
            elif len(parts) == 1:
                return float(Fraction(parts[0]))
        except Exception:
            return 1.0

    try:
        return float(text)
    except Exception:
        return 1.0


def parse_ingredient_line(raw_line: str) -> IngredientItem:
    """
    Parses a raw ingredient string into structured amount, unit, name, and aisle category.
    Example: '2 1/2 cups all-purpose flour, sifted'
    -> amount: 2.5, unit: 'cup', name: 'all-purpose flour, sifted', category: 'Pantry'
    """
    cleaned = raw_line.strip()
    if not cleaned:
        return IngredientItem(name="Unknown", amount=1.0, unit="", category="Other", raw_text=raw_line)

    # Replace unicode fractions with spaced format
    for char, val in UNICODE_FRACTIONS.items():
        if char in cleaned:
            cleaned = cleaned.replace(char, f" {val} ")

    # Regex to capture leading quantity (e.g. "2", "2.5", "1 1/2", "1-2")
    qty_regex = r"^([\d\s\/\.\-]+)\s*(.*)$"
    match = re.match(qty_regex, cleaned)

    amount = 1.0
    rest = cleaned

    if match:
        raw_qty = match.group(1).strip()
        candidate_rest = match.group(2).strip()

        # Handle range like "2-3" -> average 2.5
        if "-" in raw_qty:
            range_parts = raw_qty.split("-")
            try:
                p1 = parse_fraction(range_parts[0])
                p2 = parse_fraction(range_parts[1])
                amount = round((p1 + p2) / 2.0, 2)
                rest = candidate_rest
            except Exception:
                amount = parse_fraction(raw_qty)
                rest = candidate_rest
        else:
            try:
                amount = round(parse_fraction(raw_qty), 2)
                rest = candidate_rest
            except Exception:
                amount = 1.0

    # Extract unit from front of rest
    tokens = rest.split()
    unit = ""
    name_tokens = tokens

    if tokens:
        first_word = tokens[0].rstrip(".,").lower()
        if first_word in UNIT_MAP:
            unit = UNIT_MAP[first_word]
            name_tokens = tokens[1:]
        elif len(tokens) > 1 and f"{first_word} {tokens[1].rstrip('.,').lower()}" in UNIT_MAP:
            unit = UNIT_MAP[f"{first_word} {tokens[1].rstrip('.,').lower()}"]
            name_tokens = tokens[2:]

    name = " ".join(name_tokens).strip()
    if not name:
        name = rest.strip() or cleaned

    # Clean up leading 'of ' like '1 cup of milk' -> 'milk'
    if name.lower().startswith("of "):
        name = name[3:].strip()

    category = categorize_ingredient(name)

    return IngredientItem(
        name=name,
        amount=max(amount, 0.1),
        unit=unit,
        category=category,
        raw_text=raw_line,
    )


# ==============================================================================
# Recipe Scraping Engine (recipe-scrapers + BeautifulSoup4 Fallback)
# ==============================================================================

def scrape_with_beautifulsoup(html_content: str, url: str) -> RecipeResponse:
    """Fallback parser using JSON-LD schema.org/Recipe or OpenGraph tags."""
    soup = BeautifulSoup(html_content, "html.parser")

    title = "Untitled Recipe"
    image_url = None
    prep_time = 30
    servings = 4
    ingredients_raw: List[str] = []
    instructions: List[str] = []

    # 1. Search for schema.org JSON-LD
    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        if not script.string:
            continue
        try:
            data = json.loads(script.string)
            # Find the recipe node (could be single object or in @graph)
            recipe_obj = None
            if isinstance(data, dict):
                if data.get("@type") == "Recipe":
                    recipe_obj = data
                elif "@graph" in data and isinstance(data["@graph"], list):
                    for node in data["@graph"]:
                        if isinstance(node, dict) and node.get("@type") == "Recipe":
                            recipe_obj = node
                            break
            elif isinstance(data, list):
                for node in data:
                    if isinstance(node, dict) and node.get("@type") == "Recipe":
                        recipe_obj = node
                        break

            if recipe_obj:
                title = recipe_obj.get("name") or title
                # Image
                img = recipe_obj.get("image")
                if isinstance(img, str):
                    image_url = img
                elif isinstance(img, list) and img and isinstance(img[0], str):
                    image_url = img[0]
                elif isinstance(img, dict) and "url" in img:
                    image_url = img["url"]

                # Servings
                yield_val = recipe_obj.get("recipeYield")
                if yield_val:
                    if isinstance(yield_val, list) and yield_val:
                        yield_val = yield_val[0]
                    digits = re.findall(r"\d+", str(yield_val))
                    if digits:
                        servings = int(digits[0])

                # Ingredients
                ings = recipe_obj.get("recipeIngredient") or recipe_obj.get("ingredients") or []
                if isinstance(ings, list):
                    ingredients_raw = [str(i) for i in ings]

                # Instructions
                insts = recipe_obj.get("recipeInstructions") or []
                if isinstance(insts, list):
                    for step in insts:
                        if isinstance(step, str):
                            instructions.append(step)
                        elif isinstance(step, dict) and "text" in step:
                            instructions.append(step["text"])
                elif isinstance(insts, str):
                    instructions = [s.strip() for s in insts.split("\n") if s.strip()]

                break  # successfully found JSON-LD
        except Exception as e:
            logger.warning(f"Error parsing JSON-LD in fallback: {e}")

    # Fallback to OpenGraph / Meta tags if title / image missing
    if title == "Untitled Recipe":
        og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "title"})
        if og_title and og_title.get("content"):
            title = og_title["content"]
        elif soup.title and soup.title.string:
            title = soup.title.string.strip()

    if not image_url:
        og_img = soup.find("meta", property="og:image")
        if og_img and og_img.get("content"):
            image_url = og_img["content"]

    # Fallback ingredient extraction if JSON-LD had none
    if not ingredients_raw:
        for selector in [".recipe-ingredients", ".ingredients", "[class*='ingredient']"]:
            elems = soup.select(selector)
            if elems:
                for el in elems:
                    lis = el.find_all("li")
                    if lis:
                        for li in lis:
                            text = li.get_text(strip=True)
                            if text and len(text) > 2:
                                ingredients_raw.append(text)
                if ingredients_raw:
                    break

    # Parse raw ingredient lines into structured objects
    parsed_ingredients = [parse_ingredient_line(line) for line in ingredients_raw if line.strip()]

    return RecipeResponse(
        title=title,
        source_url=url,
        image_url=image_url or "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80",
        prep_time_mins=prep_time,
        servings=max(servings, 1),
        tags=["Imported", "Scraped"],
        ingredients=parsed_ingredients,
        instructions=instructions if instructions else ["Follow standard preparation directions for this recipe."],
    )


# ==============================================================================
# API Endpoints
# ==============================================================================

@app.get("/")
def read_root():
    return {
        "service": "PrepFast Recipe & Grocery Engine",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "prepfast-backend"}


@app.post("/api/parse-recipe", response_model=RecipeResponse)
async def parse_recipe_endpoint(req: RecipeParseRequest):
    """
    Scrapes and parses a recipe URL. Uses recipe-scrapers first,
    falling back to BeautifulSoup4 JSON-LD and OpenGraph parsing.
    """
    url = req.url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL scheme. Must begin with http:// or https://",
        )

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    # Attempt 1: Try recipe-scrapers library
    try:
        from recipe_scrapers import scrape_me

        scraper = scrape_me(url, wild_mode=True)
        title = scraper.title()
        image = scraper.image()
        total_time = scraper.total_time() or 30
        yields = scraper.yields()
        servings = 4
        if yields:
            digits = re.findall(r"\d+", str(yields))
            if digits:
                servings = int(digits[0])

        raw_ingredients = scraper.ingredients()
        instructions = scraper.instructions_list() if hasattr(scraper, "instructions_list") else [scraper.instructions()]

        parsed_ings = [parse_ingredient_line(i) for i in raw_ingredients if i.strip()]

        return RecipeResponse(
            title=title,
            source_url=url,
            image_url=image,
            prep_time_mins=total_time,
            servings=max(servings, 1),
            tags=["Scraped", "Recipe-Scraper"],
            ingredients=parsed_ings,
            instructions=[s for s in instructions if s.strip()],
        )
    except Exception as scrape_err:
        logger.info(f"recipe-scrapers library bypass/failure ({scrape_err}). Engaging BeautifulSoup fallback...")

    # Attempt 2: Direct HTTP fetch with BeautifulSoup & JSON-LD schema parsing
    try:
        async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to fetch recipe URL. Remote site returned HTTP {resp.status_code}.",
                )
            recipe_result = scrape_with_beautifulsoup(resp.text, url)
            return recipe_result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scraping recipe from {url}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not parse recipe from URL: {str(e)}",
        )


@app.post("/api/normalize-ingredients", response_model=List[IngredientItem])
def normalize_ingredients_endpoint(raw_lines: List[str]):
    """Takes a list of raw ingredient strings and returns normalized items."""
    return [parse_ingredient_line(line) for line in raw_lines if line.strip()]


@app.post("/api/aggregate-grocery-list", response_model=GroceryListResponse)
def aggregate_grocery_list_endpoint(req: AggregateGroceryRequest):
    """
    Aggregates ingredients across all scheduled meal plans, applies serving scalers,
    normalizes units, deducts pantry inventory stock, and groups items by supermarket aisle.
    """
    # Key: (normalized_name, unit) -> dict
    aggregated: Dict[str, Dict] = {}

    for meal in req.meal_plans:
        # Scale factor = planned_servings / base_servings
        scale_ratio = float(meal.servings_scaled) / max(float(meal.base_servings), 1.0)

        for ing in meal.ingredients:
            clean_name = ing.name.strip().lower()
            # Normalize common plurals/singulars for grouping
            clean_name = re.sub(r"ies$", "y", clean_name)
            clean_name = re.sub(r"es$", "", clean_name)
            clean_name = re.sub(r"s$", "", clean_name)

            unit = ing.unit.strip().lower()
            key = f"{clean_name}::{unit}"

            scaled_amount = round(ing.amount * scale_ratio, 2)

            if key not in aggregated:
                aggregated[key] = {
                    "name": ing.name.title(),
                    "unit": ing.unit,
                    "category": ing.category or categorize_ingredient(ing.name),
                    "original_needed": 0.0,
                    "recipes": set(),
                }

            aggregated[key]["original_needed"] += scaled_amount
            aggregated[key]["recipes"].add(meal.recipe_title)

    # Build pantry lookup dictionary: item_name (lower) -> amount
    pantry_lookup: Dict[str, float] = {}
    if req.deduct_pantry and req.pantry_items:
        for p in req.pantry_items:
            p_name = p.item_name.strip().lower()
            p_name = re.sub(r"ies$", "y", p_name)
            p_name = re.sub(r"es$", "", p_name)
            p_name = re.sub(r"s$", "", p_name)
            pantry_lookup[p_name] = pantry_lookup.get(p_name, 0.0) + p.amount

    # Convert aggregated map to aisle-grouped list
    items_by_aisle: Dict[str, List[AggregatedGroceryItem]] = {
        "Produce": [],
        "Dairy": [],
        "Meat": [],
        "Pantry": [],
        "Spices": [],
        "Frozen": [],
        "Bakery": [],
        "Beverages": [],
        "Other": [],
    }

    for key, data in aggregated.items():
        clean_name = key.split("::")[0]
        needed_qty = round(data["original_needed"], 2)
        pantry_stock = 0.0

        if req.deduct_pantry:
            # Check direct or partial match in pantry
            matched_pantry_key = None
            for p_k in pantry_lookup:
                if p_k in clean_name or clean_name in p_k:
                    matched_pantry_key = p_k
                    break

            if matched_pantry_key:
                pantry_stock = pantry_lookup[matched_pantry_key]

        net_needed = max(0.0, round(needed_qty - pantry_stock, 2))

        # Only omit if pantry completely covers and user requested deduction
        if req.deduct_pantry and net_needed <= 0.0:
            continue

        item = AggregatedGroceryItem(
            name=data["name"],
            original_needed=needed_qty,
            pantry_stock=pantry_stock,
            net_needed=net_needed,
            unit=data["unit"],
            category=data["category"],
            recipes=list(data["recipes"]),
            checked=False,
        )

        cat = data["category"] if data["category"] in items_by_aisle else "Other"
        items_by_aisle[cat].append(item)

    # Format into ordered aisle groups
    aisle_order = ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Bakery", "Beverages", "Other"]
    aisles_output: List[AisleGroup] = []
    total_count = 0

    for cat in aisle_order:
        items = items_by_aisle.get(cat, [])
        if items:
            total_count += len(items)
            aisles_output.append(AisleGroup(category=cat, count=len(items), items=items))

    return GroceryListResponse(total_items_count=total_count, aisles=aisles_output)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

