# EXTEP 🍳

**Smart Recipe Vault, Interactive Meal Planner & Automated Grocery Generator**

EXTEP is a modern full-stack web application designed to streamline meal planning, recipe management, and grocery shopping. It combines modern web UX with intelligent recipe parsing, serving scaling, dynamic theme switching (System, Light, Dark), and aisle-categorized shopping lists with automatic pantry deduction.

---

## 🌟 Key Features

1. **Smart Recipe Vault (`/recipes`)**
   - **URL Importer:** Paste any recipe URL (Allrecipes, NYT Cooking, Food Network, culinary blogs) to scrape title, prep time, yield, ingredients, instructions, and photo with automatic aisle categorization.
   - **Editable Review Flow:** Inspect and tweak extracted quantities, units, and auto-classified aisle categories before saving to the database.
   - **Custom Recipe Builder:** Create recipes manually with dynamic ingredient rows and step-by-step directions.
   - **Filter & Search:** Real-time search and tag filtering (Dinner, High-Protein, Vegetarian, Quick & Easy, etc.).

2. **Interactive Drag-and-Drop Meal Planner (`/planner`)**
   - **7-Day Weekly Grid:** Monday through Sunday broken into 4 meal slots (`Breakfast`, `Lunch`, `Dinner`, `Snack`).
   - **Draggable Recipe Sidebar:** Drag saved recipes from the sidebar directly into any calendar slot powered by `@hello-pangea/dnd`.
   - **Dynamic Serving Scaler:** Adjust planned yields (`+` / `-` servings) directly on each meal card, dynamically scaling ingredient requirements.
   - **Mobile-Friendly:** Quick click-to-add modal ensures smooth scheduling on smartphones and tablets.

3. **Automated Grocery List Engine (`/grocery-list`)**
   - **Ingredient Aggregation:** Automatically merges identical ingredients across scheduled meals (e.g., `1 cup flour` + `0.5 cups flour` = `1.5 cups flour`).
   - **Pantry Subtraction:** One-click toggle: *"Deduct items currently in my Pantry"*. Net quantities needed are calculated automatically (`needed = max(0, planned - pantry)`).
   - **Aisle Categorization:** Automatically groups items by supermarket department (`Produce`, `Dairy`, `Meat`, `Pantry`, `Spices`, `Frozen`, `Bakery`, `Beverages`, `Other`).
   - **Interactive Checklist:** Strike through items as you walk through supermarket aisles with shopping progress indicators and celebratory confetti when done.
   - **Quick Add & Export:** Add custom items (e.g. coffee, paper towels) and copy or print the list with one click.

4. **Pantry Inventory Tracker (`/pantry`)**
   - Track staple ingredients on hand.
   - Quick-add interface with quantity steppers and aisle categorization.

5. **Dynamic Theme Switching**
   - Seamless support for **System Default**, **Light**, and **Dark** modes via `next-themes` and Tailwind CSS.

---

## 📐 Architecture & Tech Stack

- **Frontend & Fullstack API:** Next.js 14 (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS (`darkMode: ["class"]`), Framer Motion, Lucide Icons, `next-themes`
- **Drag-and-Drop:** `@hello-pangea/dnd`
- **Scraper & Normalizer:** Native Node.js & Cheerio engine + optional Python FastAPI backend
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Storage Bucket)
- **Deployment:** Vercel (Frontend & Serverless API) / Docker

---

## 📂 Codebase Directory Layout

```text
EXTEP/
├── frontend/                     # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/              # Native Node.js API endpoints
│   │   │   │   ├── parse-recipe/
│   │   │   │   ├── normalize-ingredients/
│   │   │   │   └── aggregate-grocery-list/
│   │   │   ├── layout.tsx        # Root layout with ThemeProvider & Sidebar
│   │   │   ├── page.tsx          # Dashboard overview & today's meals
│   │   │   ├── globals.css       # Tailwind CSS styles & dark variables
│   │   │   ├── recipes/
│   │   │   │   └── page.tsx      # Recipe Vault & search/filter
│   │   │   ├── planner/
│   │   │   │   └── page.tsx      # Drag-and-drop 7-day meal planner
│   │   │   ├── grocery-list/
│   │   │   │   └── page.tsx      # Aisle-categorized grocery checklist
│   │   │   └── pantry/
│   │   │       └── page.tsx      # Pantry stock inventory tracker
│   │   ├── components/
│   │   │   ├── Sidebar.tsx       # Navigation bar with ThemeToggle
│   │   │   ├── ThemeProvider.tsx # Next-themes Provider wrapper
│   │   │   ├── ThemeToggle.tsx   # System / Light / Dark switcher
│   │   │   ├── RecipeCard.tsx    # Card with prep time, servings & tags
│   │   │   ├── RecipeModal.tsx   # Detailed recipe view with serving scaler
│   │   │   ├── ImportRecipeModal.tsx # URL scraper preview & editor
│   │   │   └── AddRecipeModal.tsx    # Manual recipe creation form
│   │   └── lib/
│   │       ├── api.ts            # Client API caller & local fallback
│   │       ├── recipeParser.ts   # Scraping & unit normalization engine
│   │       ├── initialData.ts    # Pre-seeded chef-crafted recipes
│   │       ├── store.ts          # Reactive client store & Supabase sync
│   │       ├── supabase.ts       # Supabase browser client
│   │       ├── types.ts          # TypeScript interfaces
│   │       └── utils.ts          # Fraction & date formatting helpers
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                      # Optional Python FastAPI Service
├── supabase/
│   ├── schema.sql                # Complete PostgreSQL DDL with RLS
│   └── seed.sql                  # Seed data with curated recipes
│
├── package.json                  # Root npm workspace commands
├── docker-compose.yml            # Multi-container orchestration
└── README.md                     # Project documentation
```

---

## 🚀 Running Locally

```bash
# From workspace root:
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Zero-Config Demo Mode:** EXTEP runs out-of-the-box with preloaded recipes, meal planner, and grocery generator using local persistence if Supabase credentials are not yet configured! To connect to your Supabase project, copy `.env.example` to `.env.local` and add your URL and anon key.
