import { NextRequest, NextResponse } from 'next/server';
import { AisleCategory, GroceryAisleGroup, GroceryItem } from '@/lib/types';
import { categorizeIngredient } from '@/lib/recipeParser';

interface RequestBody {
  meal_plans: {
    recipe_id?: string;
    recipe_title: string;
    servings_scaled: number;
    base_servings: number;
    ingredients: {
      name: string;
      amount: number;
      unit: string;
      category?: AisleCategory;
    }[];
  }[];
  pantry_items?: {
    item_name: string;
    amount: number;
    unit: string;
    category?: AisleCategory;
  }[];
  deduct_pantry?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const mealPlans = body.meal_plans || [];
    const pantryItems = body.pantry_items || [];
    const deductPantry = body.deduct_pantry ?? true;

    const aggregated: Record<
      string,
      {
        name: string;
        unit: string;
        category: AisleCategory;
        original_needed: number;
        recipes: Set<string>;
      }
    > = {};

    for (const meal of mealPlans) {
      const scaleRatio =
        (Number(meal.servings_scaled) || 4) / Math.max(Number(meal.base_servings) || 4, 1);

      for (const ing of meal.ingredients || []) {
        let cleanName = (ing.name || '').trim().toLowerCase();
        cleanName = cleanName.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');

        const unit = (ing.unit || '').trim().toLowerCase();
        const key = `${cleanName}::${unit}`;
        const scaledAmount = Number(((ing.amount || 1) * scaleRatio).toFixed(2));

        if (!aggregated[key]) {
          aggregated[key] = {
            name: ing.name ? ing.name.charAt(0).toUpperCase() + ing.name.slice(1) : 'Item',
            unit: ing.unit || '',
            category: ing.category || categorizeIngredient(ing.name),
            original_needed: 0,
            recipes: new Set(),
          };
        }

        aggregated[key].original_needed = Number(
          (aggregated[key].original_needed + scaledAmount).toFixed(2)
        );
        aggregated[key].recipes.add(meal.recipe_title);
      }
    }

    const pantryLookup: Record<string, number> = {};
    if (deductPantry && pantryItems.length > 0) {
      for (const p of pantryItems) {
        let pName = (p.item_name || '').trim().toLowerCase();
        pName = pName.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');
        pantryLookup[pName] = (pantryLookup[pName] || 0) + (p.amount || 0);
      }
    }

    const itemsByAisle: Record<AisleCategory, GroceryItem[]> = {
      Produce: [],
      Dairy: [],
      Meat: [],
      Pantry: [],
      Spices: [],
      Frozen: [],
      Bakery: [],
      Beverages: [],
      Other: [],
    };

    for (const [key, data] of Object.entries(aggregated)) {
      const cleanName = key.split('::')[0];
      const neededQty = data.original_needed;
      let pantryStock = 0;

      if (deductPantry) {
        let matchedPantryKey: string | null = null;
        for (const pK of Object.keys(pantryLookup)) {
          if (pK.includes(cleanName) || cleanName.includes(pK)) {
            matchedPantryKey = pK;
            break;
          }
        }
        if (matchedPantryKey) {
          pantryStock = pantryLookup[matchedPantryKey];
        }
      }

      const netNeeded = Math.max(0, Number((neededQty - pantryStock).toFixed(2)));

      if (deductPantry && netNeeded <= 0) {
        continue;
      }

      const item: GroceryItem = {
        id: `grocery-${cleanName}-${data.unit}`,
        name: data.name,
        original_needed: neededQty,
        pantry_stock: pantryStock,
        net_needed: netNeeded,
        unit: data.unit,
        category: data.category,
        recipes: Array.from(data.recipes),
        checked: false,
      };

      const cat = itemsByAisle[data.category] ? data.category : 'Other';
      itemsByAisle[cat].push(item);
    }

    const aisleOrder: AisleCategory[] = [
      'Produce',
      'Dairy',
      'Meat',
      'Pantry',
      'Spices',
      'Frozen',
      'Bakery',
      'Beverages',
      'Other',
    ];

    const aisles: GroceryAisleGroup[] = [];
    let totalCount = 0;

    for (const cat of aisleOrder) {
      const items = itemsByAisle[cat] || [];
      if (items.length > 0) {
        totalCount += items.length;
        aisles.push({
          category: cat,
          count: items.length,
          items,
        });
      }
    }

    return NextResponse.json({
      total_items_count: totalCount,
      aisles,
    });
  } catch (err: any) {
    console.error('Error in /api/aggregate-grocery-list route:', err);
    return NextResponse.json(
      { detail: err.message || 'Failed to aggregate grocery list' },
      { status: 500 }
    );
  }
}

