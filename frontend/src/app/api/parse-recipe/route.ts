import { NextRequest, NextResponse } from 'next/server';
import { scrapeRecipeHtml } from '@/lib/recipeParser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url?.trim();

    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return NextResponse.json(
        { detail: 'Invalid URL. Must begin with http:// or https://' },
        { status: 400 }
      );
    }

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    const res = await fetch(url, { headers, redirect: 'follow' });
    if (!res.ok) {
      return NextResponse.json(
        { detail: `Failed to fetch recipe URL. Site returned HTTP ${res.status}` },
        { status: 400 }
      );
    }

    const html = await res.text();
    const parsedRecipe = await scrapeRecipeHtml(url, html);

    return NextResponse.json(parsedRecipe);
  } catch (error: any) {
    console.error('Error in /api/parse-recipe route:', error);
    return NextResponse.json(
      { detail: error.message || 'Failed to parse recipe from URL' },
      { status: 500 }
    );
  }
}

