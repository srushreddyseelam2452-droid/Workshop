# 🧳 Weekend Getaway Itinerary Builder

> **AI-Powered Travel Planning Web Application** built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Google Gemini AI**, and **Supabase (PostgreSQL)**.

---

## 🌟 Overview

Planning a weekend getaway is often tedious: juggling flights, budgeting across hotels and meals, finding local attractions, and estimating transit times. **Weekend Getaway Itinerary Builder** solves this by converting user travel preferences into a personalized, time-based, budget-optimized weekend schedule in seconds.

Powered by **Google Gemini 1.5 Flash**, the application balances user preferences (origin, destination, dates, budget, group size, and interests) while creating realistic schedules with local dining spots, activity timings, geographic proximity optimization, and cost breakdowns.

---

## 🚀 Key Features

### 1. 🤖 Google Gemini AI Travel Planner
- **Personalized Itineraries:** Generates day-by-day, hour-by-hour schedules covering morning, midday, afternoon, and evening.
- **Smart Recommendations:** Suggests attractions, dining spots, and hidden gems tailored to user vibes (e.g. Foodie, Wine Tasting, Nature & Hiking, Culture).
- **Proximity-Aware Scheduling:** Organizes activities in realistic geographic sequences with estimated transit times and insider tips.
- **Dynamic Fallback Engine:** Features an intelligent offline/fallback generator that ensures a smooth demo experience even when API keys are not provided.

### 2. 💰 Category-Wise Budget Breakdown & AI Optimizer
- Real-time cost estimates for:
  - 🚗 Transportation (flights, trains, fuel, rides)
  - 🏨 Accommodation (hotels, Airbnb, cabins)
  - 🍽️ Food & Dining (cafes, lunch spots, dinners)
  - 🎟️ Activities & Attractions (museums, tours, tastings)
  - 🛡️ Miscellaneous & Buffer
- **AI Budget Optimizer:** Identifies categories exceeding targets and suggests practical savings alternatives with 1-click recalculation.

### 3. 🔄 Interactive AI Replanner
- Modify any existing itinerary using natural language prompts (e.g., *"Make this trip 20% cheaper"*, *"Replace outdoor hikes with art galleries"*, or *"Add more vegetarian dining spots"*).
- Instant AI replan preserves your trip duration while updating activities and budget allocations in-place.

### 4. 📄 Professional PDF Export
- Export complete weekend itineraries directly into printable, multi-page PDFs using `jspdf`.
- Formatted with headers, daily schedules, pro tips, budget breakdowns, and page numbering.

### 5. 🗄️ Supabase PostgreSQL Persistence & RLS
- Stores user accounts and itineraries in a secure PostgreSQL database.
- Row Level Security (RLS) policies guarantee users access only their private trips.
- Dual-mode architecture: Seamlessly falls back to local storage when running in demo mode before Supabase credentials are plugged in.

### 6. 📊 Centralized Dashboard & Saved Trips Management
- Key metrics: Total Trips, Upcoming Trips, Completed Trips, and Estimated Spend.
- Search by destination or title.
- Filter by status (`planned`, `upcoming`, `completed`, `cancelled`).
- Sort by date, budget, or title.
- Switch between **Grid Cards** and **Table View**.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Engine:** [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```
weekend-getaway-builder/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-itinerary/  # Google Gemini AI generation route
│   │   │   ├── replan-itinerary/    # AI itinerary modification route
│   │   │   ├── optimize-budget/     # Category budget optimization route
│   │   │   ├── trips/               # GET & POST trips
│   │   │   └── trips/[id]/          # Single trip CRUD routes
│   │   ├── create/             # Trip Creation wizard page
│   │   ├── settings/           # API Keys, Supabase & DB settings
│   │   ├── trips/              # Saved Trips management page
│   │   │   └── [id]/           # Trip detail, timeline, and budget view
│   │   ├── globals.css         # Tailwind styles & theme variables
│   │   ├── layout.tsx          # Root layout with Navbar & Footer
│   │   └── page.tsx            # Dashboard overview page
│   ├── components/
│   │   ├── AIReplannerModal.tsx    # Natural language trip modifier modal
│   │   ├── AuthModal.tsx           # Supabase Auth modal
│   │   ├── BudgetBreakdownView.tsx # Budget cards & AI optimizer UI
│   │   ├── Footer.tsx              # Application footer
│   │   ├── ItineraryTimeline.tsx   # Interactive schedule timeline
│   │   ├── Navbar.tsx              # Top navigation bar
│   │   ├── PackingListView.tsx     # Checklist & weather forecast
│   │   ├── StatsCards.tsx          # Dashboard summary metrics
│   │   ├── TripCard.tsx            # Trip card with status changer
│   │   └── TripForm.tsx            # Multi-field trip creation form
│   ├── lib/
│   │   ├── gemini.ts           # Server-side Google Gemini client & prompts
│   │   ├── mock-data.ts        # Preloaded trips & dynamic fallback engine
│   │   ├── pdf-export.ts       # jsPDF formatting & download handler
│   │   ├── storage.ts          # Unified Supabase + LocalStorage adapter
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       └── server.ts       # Server Supabase client
│   └── types/
│       └── trip.ts             # TypeScript interfaces and types
├── supabase-schema.sql         # PostgreSQL schema with RLS policies
├── .env.example                # Example environment variables
├── package.json
└── tsconfig.json
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js** (v18.17 or higher, tested on Node v24)
- **npm** (or yarn / pnpm)

### 2. Installation
```bash
# Clone the repository and navigate into directory
cd weekend-getaway-builder

# Install dependencies
npm install
```

### 3. Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your keys in `.env.local`:
```env
# Google Gemini API Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Credentials (from Supabase Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

> **Note:** The app works immediately out-of-the-box in **Demo Mode** even without environment variables! You can also enter your Gemini API Key directly into the **Settings** page in the UI.

### 4. Supabase PostgreSQL Setup
If you want to use Supabase for persistent cloud storage:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Open `supabase-schema.sql` from this repository and run it. It will create:
   - `profiles` table with automatic user creation trigger
   - `trips` table with `itinerary_data` (JSONB) column
   - Row Level Security (RLS) policies allowing users to manage only their own trips.
4. Add your Supabase URL and Anon Key to `.env.local`.

### 5. Run the Application
```bash
# Start development server
npm run dev

# Or build and run production server
npm run build
npm run start
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing the AI & Features

1. **Dashboard:** Browse pre-loaded weekend getaways (Napa Valley, Boston, Goa) or filter by status.
2. **Create a Trip:** Go to `Plan Trip`, pick an origin and destination (or click any of the popular getaway presets), specify dates, budget, group size, and interests. Click **Generate Itinerary with AI**.
3. **Explore Itinerary:**
   - Interactive hour-by-hour schedule with checkable activities.
   - Category-wise budget breakdown with the **AI Optimizer** button.
   - Destination packing list and expected weather advice.
4. **AI Replanning:** Click **AI Replan**, choose a preset like *"Make this trip 20% cheaper"* or enter custom instructions, and watch the itinerary update.
5. **Download PDF:** Click **Download PDF** to export a formatted travel document.
6. **Settings & Keys:** Configure and test your Google Gemini API key or view the Supabase schema in `/settings`.

---

## 📄 License
MIT License. Built for students and travellers worldwide.
