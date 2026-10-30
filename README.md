# PrepFast 🍳

**Smart Recipe Vault, Interactive Meal Planner & Automated Grocery Generator**

PrepFast is a full-stack web application designed to streamline meal planning, recipe management, and grocery shopping. It combines modern web UX with an intelligent Python backend for recipe parsing, serving scaling, and aisle-categorized shopping lists with automatic pantry deduction.

---

## 🌟 Key Features

1. **Smart Recipe Vault (`/recipes`)**
   - **URL Importer:** Paste any recipe URL (Allrecipes, NYT Cooking, Food Network, culinary blogs) to scrape title, prep time, yield, ingredients, instructions, and photo via FastAPI (`recipe-scrapers` + `BeautifulSoup4` JSON-LD schema fallback).
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

---

## 📐 Architecture & Tech Stack

- **Frontend:** Next.js 14 (App Router, React 18, TypeScript)
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons
- **Drag-and-Drop:** `@hello-pangea/dnd`
- **Backend API:** Python 3.11+ (FastAPI, Uvicorn, BeautifulSoup4, Recipe-Scrapers, Pydantic, HTTPX)
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Storage Bucket)
- **Deployment:** Vercel (Frontend) + Render / Fly.io / Docker (Backend)

---

## 📂 Codebase Directory Layout

```text
PREPFAS/
├── backend/                      # Python FastAPI Service
│   ├── main.py                   # Recipe scraping, parsing & aggregation API
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Production Docker container
│   ├── render.yaml               # Deployment config for Render
│   └── fly.toml                  # Deployment config for Fly.io
│
├── frontend/                     # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout with responsive Sidebar
│   │   │   ├── page.tsx          # Dashboard overview & today's meals
│   │   │   ├── globals.css       # Tailwind CSS styles & print styles
│   │   │   ├── recipes/
│   │   │   │   └── page.tsx      # Recipe Vault & search/filter
│   │   │   ├── planner/
│   │   │   │   └── page.tsx      # Drag-and-drop 7-day meal planner
│   │   │   ├── grocery-list/
│   │   │   │   └── page.tsx      # Aisle-categorized grocery checklist
│   │   │   └── pantry/
│   │   │       └── page.tsx      # Pantry stock inventory tracker
│   │   ├── components/
│   │   │   ├── Sidebar.tsx       # Navigation bar with mobile drawer
│   │   │   ├── RecipeCard.tsx    # Card with prep time, servings & tags
│   │   │   ├── RecipeModal.tsx   # Detailed recipe view with serving scaler
│   │   │   ├── ImportRecipeModal.tsx # URL scraper preview & editor
│   │   │   └── AddRecipeModal.tsx    # Manual recipe creation form
│   │   └── lib/
│   │       ├── api.ts            # Backend API client & local engine
│   │       ├── initialData.ts    # Pre-seeded chef-crafted recipes
│   │       ├── store.ts          # Reactive client store & Supabase sync
│   │       ├── supabase.ts       # Supabase browser client
│   │       ├── types.ts          # TypeScript interfaces
│   │       └── utils.ts          # Fraction & date formatting helpers
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── supabase/
│   ├── schema.sql                # Complete PostgreSQL DDL with RLS
│   └── seed.sql                  # Seed data with 4 curated recipes
│
├── docker-compose.yml            # Multi-container orchestration
└── README.md                     # Project documentation
```

---

## 🗄️ Database Setup (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. Copy and run the contents of [`supabase/schema.sql`](supabase/schema.sql):
   - Creates `recipes`, `ingredients`, `meal_plans`, `pantry` tables.
   - Sets foreign keys with `ON DELETE CASCADE`.
   - Configures Row Level Security (RLS) policies allowing users to manage only their own data.
   - Creates the `recipe-images` public storage bucket.
4. (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to populate sample recipes and meal plans.

---

## 🚀 Running Locally

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API documentation is available at `http://localhost:8000/docs`.

### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Zero-Config Demo Mode:** PrepFast runs out-of-the-box with preloaded recipes, meal planner, and grocery generator using local persistence if Supabase credentials are not yet configured! To connect to your Supabase project, copy `.env.example` to `.env.local` and add your URL and anon key.

---

## 🚢 Production Deployment

### Backend (Render / Fly.io)
- **Render:** Connect your Git repo; Render automatically picks up [`backend/render.yaml`](backend/render.yaml).
- **Fly.io:** Run `fly launch` inside `backend/` using [`backend/fly.toml`](backend/fly.toml).

### Frontend (Vercel)
1. Push your repository to GitHub.
2. Import the project in Vercel with Root Directory set to `frontend`.
3. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed FastAPI backend URL
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL (optional)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key (optional)

