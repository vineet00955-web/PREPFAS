import { NextRequest, NextResponse } from 'next/server';
import { parseIngredientLine } from '@/lib/recipeParser';

export async function POST(req: NextRequest) {
  try {
    const rawLines = (await req.json()) as string[];
    if (!Array.isArray(rawLines)) {
      return NextResponse.json(
        { detail: 'Expected an array of ingredient strings' },
        { status: 400 }
      );
    }

    const parsed = rawLines
      .filter((l) => typeof l === 'string' && l.trim())
      .map((l) => parseIngredientLine(l));

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Failed to normalize ingredients' },
      { status: 500 }
    );
  }
}

