import * as cheerio from 'cheerio';
import { AisleCategory, ParsedRecipeResponse } from './types';

export const UNICODE_FRACTIONS: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅓': 0.333,
  '⅔': 0.666,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

export const UNIT_MAP: Record<string, string> = {
  // Volume - small
  tsp: 'tsp',
  tsps: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  t: 'tsp',
  tbsp: 'tbsp',
  tbsps: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tbs: 'tbsp',
  tb: 'tbsp',
  T: 'tbsp',
  // Volume - large
  cup: 'cup',
  cups: 'cup',
  c: 'cup',
  pint: 'pint',
  pints: 'pint',
  pt: 'pint',
  quart: 'quart',
  quarts: 'quart',
  qt: 'quart',
  gallon: 'gallon',
  gallons: 'gallon',
  gal: 'gallon',
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  l: 'l',
  liter: 'l',
  liters: 'l',
  'fl oz': 'fl oz',
  'fluid ounce': 'fl oz',
  'fluid ounces': 'fl oz',
  // Weight
  oz: 'oz',
  ozs: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  // Count / Items
  clove: 'clove',
  cloves: 'clove',
  can: 'can',
  cans: 'can',
  stalk: 'stalk',
  stalks: 'stalk',
  slice: 'slice',
  slices: 'slice',
  fillet: 'fillet',
  fillets: 'fillet',
  bunch: 'bunch',
  bunches: 'bunch',
  head: 'head',
  heads: 'head',
  pinch: 'pinch',
  pinches: 'pinch',
  dash: 'dash',
  package: 'package',
  packages: 'package',
  pkg: 'package',
  piece: 'piece',
  pieces: 'piece',
  whole: 'whole',
};

export const CATEGORY_KEYWORDS: Record<AisleCategory, string[]> = {
  Produce: [
    'garlic', 'onion', 'lemon', 'lime', 'tomato', 'potato', 'spinach', 'kale',
    'carrot', 'celery', 'cilantro', 'parsley', 'dill', 'basil', 'mushroom',
    'pepper', 'lettuce', 'apple', 'banana', 'ginger', 'berry', 'berries',
    'blueberry', 'strawberry', 'avocado', 'zucchini', 'cucumber', 'broccoli',
    'cauliflower', 'cabbage', 'asparagus', 'rosemary', 'thyme', 'scallion',
    'shallot', 'mint', 'arugula', 'sweet potato', 'squash'
  ],
  Dairy: [
    'milk', 'butter', 'cheese', 'cream', 'heavy cream', 'yogurt', 'parmesan',
    'cheddar', 'mozzarella', 'sour cream', 'egg', 'eggs', 'feta', 'ricotta',
    'almond milk', 'oat milk', 'ghee', 'half and half'
  ],
  Meat: [
    'chicken', 'beef', 'pork', 'salmon', 'fish', 'turkey', 'shrimp', 'bacon',
    'sausage', 'steak', 'tuna', 'lamb', 'ground beef', 'chicken breast',
    'prosciutto', 'ham', 'cod', 'tilapia', 'prawn'
  ],
  Pantry: [
    'olive oil', 'vegetable oil', 'oil', 'flour', 'sugar', 'brown sugar',
    'rice', 'quinoa', 'pasta', 'beans', 'black beans', 'chickpeas', 'broth',
    'chicken broth', 'vegetable broth', 'vinegar', 'balsamic', 'oats',
    'rolled oats', 'soy sauce', 'tahini', 'cornstarch', 'maple syrup', 'honey',
    'coconut milk', 'baking powder', 'baking soda', 'chia', 'chia seeds',
    'yeast', 'peanut butter', 'almond butter', 'mustard', 'mayonnaise',
    'canned tomato', 'sun-dried tomato', 'protein powder'
  ],
  Spices: [
    'salt', 'sea salt', 'pepper', 'black pepper', 'cumin', 'oregano', 'paprika',
    'smoked paprika', 'chili powder', 'cinnamon', 'nutmeg', 'curry powder',
    'bay leaf', 'coriander', 'turmeric', 'cayenne', 'red pepper flakes',
    'cardamom', 'cloves powder', 'garlic powder', 'onion powder', 'italian seasoning'
  ],
  Frozen: [
    'frozen peas', 'frozen corn', 'ice cream', 'frozen berries', 'frozen spinach'
  ],
  Bakery: [
    'bread', 'bun', 'buns', 'tortilla', 'tortillas', 'pita', 'bagel', 'croissant'
  ],
  Beverages: [
    'coffee', 'tea', 'wine', 'white wine', 'red wine', 'juice', 'lemon juice'
  ],
  Other: []
};

export function categorizeIngredient(name: string): AisleCategory {
  const lowered = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [AisleCategory, string[]][]) {
    for (const kw of keywords) {
      const stem = kw.endsWith('s') ? kw.slice(0, -1) : kw;
      const regex = new RegExp(`\\b${stem}`, 'i');
      if (regex.test(lowered)) {
        return cat;
      }
    }
  }
  return 'Other';
}

export function parseFraction(text: string): number {
  const trimmed = text.trim();
  for (const [char, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (trimmed.includes(char)) {
      const parts = trimmed.split(char);
      const base = parts[0].trim() ? parseFloat(parts[0].trim()) : 0;
      return (isNaN(base) ? 0 : base) + val;
    }
  }

  if (trimmed.includes('/')) {
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2) {
      const base = parseFloat(parts[0]);
      const [num, den] = parts[1].split('/').map(Number);
      return (isNaN(base) ? 0 : base) + (den ? num / den : 0);
    } else if (parts.length === 1) {
      const [num, den] = parts[0].split('/').map(Number);
      return den ? num / den : 1;
    }
  }

  const num = parseFloat(trimmed);
  return isNaN(num) ? 1.0 : num;
}

export function parseIngredientLine(rawLine: string): {
  name: string;
  amount: number;
  unit: string;
  category: AisleCategory;
  raw_text?: string;
} {
  let cleaned = rawLine.trim();
  if (!cleaned) {
    return { name: 'Unknown', amount: 1.0, unit: '', category: 'Other', raw_text: rawLine };
  }

  for (const [char, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (cleaned.includes(char)) {
      cleaned = cleaned.replace(char, ` ${val} `);
    }
  }

  const qtyRegex = /^([\d\s\/\.\-]+)\s*(.*)$/;
  const match = cleaned.match(qtyRegex);

  let amount = 1.0;
  let rest = cleaned;

  if (match) {
    const rawQty = match[1].trim();
    const candidateRest = match[2].trim();

    if (rawQty.includes('-')) {
      const rangeParts = rawQty.split('-');
      try {
        const p1 = parseFraction(rangeParts[0]);
        const p2 = parseFraction(rangeParts[1]);
        amount = Number(((p1 + p2) / 2.0).toFixed(2));
        rest = candidateRest;
      } catch {
        amount = parseFraction(rawQty);
        rest = candidateRest;
      }
    } else {
      amount = Number(parseFraction(rawQty).toFixed(2));
      rest = candidateRest;
    }
  }

  const tokens = rest.split(/\s+/);
  let unit = '';
  let nameTokens = tokens;

  if (tokens.length > 0) {
    const firstWord = tokens[0].replace(/[.,]/g, '').toLowerCase();
    const twoWords = tokens.length > 1 ? `${firstWord} ${tokens[1].replace(/[.,]/g, '').toLowerCase()}` : '';

    if (twoWords && UNIT_MAP[twoWords]) {
      unit = UNIT_MAP[twoWords];
      nameTokens = tokens.slice(2);
    } else if (UNIT_MAP[firstWord]) {
      unit = UNIT_MAP[firstWord];
      nameTokens = tokens.slice(1);
    }
  }

  let name = nameTokens.join(' ').trim();
  if (!name) {
    name = rest.trim() || cleaned;
  }

  if (name.toLowerCase().startsWith('of ')) {
    name = name.slice(3).trim();
  }

  const category = categorizeIngredient(name);

  return {
    name,
    amount: Math.max(amount, 0.1),
    unit,
    category,
    raw_text: rawLine,
  };
}

export async function scrapeRecipeHtml(url: string, htmlContent: string): Promise<ParsedRecipeResponse> {
  const $ = cheerio.load(htmlContent);

  let title = 'Untitled Recipe';
  let imageUrl: string | undefined;
  let prepTime = 30;
  let servings = 4;
  let ingredientsRaw: string[] = [];
  const instructions: string[] = [];

  // 1. JSON-LD Schema
  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const text = $(elem).text();
      if (!text) return;
      const data = JSON.parse(text);

      let recipeObj: any = null;
      const findRecipe = (node: any) => {
        if (!node) return;
        if (node['@type'] === 'Recipe' || (Array.isArray(node['@type']) && node['@type'].includes('Recipe'))) {
          recipeObj = node;
        } else if (node['@graph'] && Array.isArray(node['@graph'])) {
          node['@graph'].forEach(findRecipe);
        } else if (Array.isArray(node)) {
          node.forEach(findRecipe);
        }
      };

      findRecipe(data);

      if (recipeObj) {
        if (recipeObj.name) title = recipeObj.name;
        
        // Image
        if (typeof recipeObj.image === 'string') {
          imageUrl = recipeObj.image;
        } else if (Array.isArray(recipeObj.image) && typeof recipeObj.image[0] === 'string') {
          imageUrl = recipeObj.image[0];
        } else if (recipeObj.image && typeof recipeObj.image.url === 'string') {
          imageUrl = recipeObj.image.url;
        }

        // Prep / Total time
        const durationStr = recipeObj.totalTime || recipeObj.prepTime || recipeObj.cookTime;
        if (durationStr && typeof durationStr === 'string') {
          const ptMatch = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
          if (ptMatch) {
            const hours = parseInt(ptMatch[1] || '0', 10);
            const mins = parseInt(ptMatch[2] || '0', 10);
            prepTime = hours * 60 + mins || 30;
          }
        }

        // Servings
        const yields = recipeObj.recipeYield;
        if (yields) {
          const yieldsStr = Array.isArray(yields) ? yields[0] : String(yields);
          const digits = yieldsStr.match(/\d+/);
          if (digits) servings = parseInt(digits[0], 10);
        }

        // Ingredients
        const ings = recipeObj.recipeIngredient || recipeObj.ingredients;
        if (Array.isArray(ings)) {
          ingredientsRaw = ings.map((i: any) => String(i).trim());
        }

        // Instructions
        const insts = recipeObj.recipeInstructions;
        if (Array.isArray(insts)) {
          insts.forEach((step: any) => {
            if (typeof step === 'string') {
              instructions.push(step.trim());
            } else if (step && step.text) {
              instructions.push(step.text.trim());
            } else if (step && step.itemListElement && Array.isArray(step.itemListElement)) {
              step.itemListElement.forEach((sub: any) => {
                if (sub.text) instructions.push(sub.text.trim());
              });
            }
          });
        } else if (typeof insts === 'string') {
          insts.split(/\n+/).forEach((line) => {
            if (line.trim()) instructions.push(line.trim());
          });
        }
      }
    } catch {
      // Ignore JSON parse errors in individual script tags
    }
  });

  // Fallbacks
  if (title === 'Untitled Recipe') {
    title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('title').text().trim() ||
      'Imported Recipe';
  }

  if (!imageUrl) {
    imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80';
  }

  if (ingredientsRaw.length === 0) {
    for (const selector of ['.recipe-ingredients', '.ingredients', '[class*="ingredient"]']) {
      const found = $(selector).find('li');
      if (found.length > 0) {
        found.each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 2) ingredientsRaw.push(text);
        });
        break;
      }
    }
  }

  const parsedIngredients = ingredientsRaw
    .filter(Boolean)
    .map((line) => parseIngredientLine(line));

  return {
    title,
    source_url: url,
    image_url: imageUrl,
    prep_time_mins: prepTime,
    servings: Math.max(servings, 1),
    tags: ['Imported', 'Web'],
    ingredients: parsedIngredients.length > 0 ? parsedIngredients : [
      { name: 'Fresh Seasonal Ingredients', amount: 2, unit: 'items', category: 'Produce' },
      { name: 'Cooking Fat or Olive Oil', amount: 2, unit: 'tbsp', category: 'Pantry' },
      { name: 'Salt & Fresh Ground Pepper', amount: 1, unit: 'tsp', category: 'Spices' },
    ],
    instructions: instructions.length > 0 ? instructions : [
      'Prepare all ingredients as listed.',
      'Combine according to directions and cook to preferred doneness.',
      'Serve fresh and enjoy!'
    ],
  };
}

