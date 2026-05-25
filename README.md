# SkincareIQ — AI-Powered Skincare Intelligence Platform

SkincareIQ is a full-stack AI skincare intelligence platform that helps users analyze skincare ingredients, detect routine conflicts, scan product labels using OCR, track skin progress, and interact with an AI skincare assistant.

---

# Live Demo

Frontend: https://skincare-intelligence.vercel.app

---

# Features

- AI-powered ingredient analysis
- Ingredient conflict detection engine
- Personalized skincare recommendations
- AI Skin Assistant chat
- OCR-based ingredient scanner
- Product scraping and analysis
- AM/PM routine builder
- Skin progress tracker
- Supabase database persistence
- Mobile-responsive dashboard
- India-specific skincare intelligence

---

# Tech Stack

## Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- Lucide React
- Vercel

## Backend
- FastAPI
- Python
- Groq LLM API
- Tesseract OCR
- Pillow
- httpx
- Playwright fallback
- Render

## Database & Infrastructure
- Supabase PostgreSQL
- Upstash Redis
- Render backend hosting
- Vercel frontend hosting

---

# Core AI Features

## Ingredient Intelligence Engine

The backend includes a deterministic ingredient analysis engine that detects:

- Retinol + exfoliating acid conflicts
- AHA/BHA over-exfoliation risk
- irritation risk
- active ingredients
- comedogenic concerns
- skin-type suitability

---

## AI Recommendation System

The platform uses Groq LLMs to generate personalized skincare recommendations based on:

- user skin type
- skin concerns
- climate zone
- budget range
- ingredient conflicts

---

## AI Skin Assistant

Users can chat naturally with an AI skincare assistant for questions like:

- “Can I use niacinamide with vitamin C?”
- “Best routine for acne scars in humid climate?”
- “Suggest ingredients for dry skin.”
- “Is retinol safe for beginners?”

---

# Project Architecture

```txt
skincare-intelligence/
├── frontend/
│   ├── app/
│   │   ├── onboarding/
│   │   └── dashboard/
│   │       ├── search/
│   │       ├── analyze/
│   │       ├── routine/
│   │       ├── scan/
│   │       ├── progress/
│   │       └── assistant/
│   ├── components/
│   └── lib/
│
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── engines/
│   │   ├── pipelines/
│   │   ├── scrapers/
│   │   └── core/
│   └── tests/
│
└── data/
    └── ingredients/
```

---

# Backend API Endpoints

```txt
GET    /health
GET    /api/v1/ingredients/
GET    /api/v1/ingredients/{inci_name}
POST   /api/v1/analysis/ingredients
POST   /api/v1/products/scrape
GET    /api/v1/products/
POST   /api/v1/ocr/scan
POST   /api/v1/recommendations/analyze
POST   /api/v1/chat/
```

---

# Deployment

## Frontend
Deployed on Vercel.

## Backend
Deployed on Render.

## Database
Hosted on Supabase PostgreSQL.

## Cache
Upstash Redis.

---

# Environment Variables

## Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Backend

```env
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

These are shown only as variable names for setup purposes.  
Do NOT put your actual secret keys into the README.

---

# Local Setup

## Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

Backend runs on:

```txt
http://127.0.0.1:8000
```

---

# Why This Project Stands Out

This is not just a basic chatbot wrapper.

SkincareIQ combines:

- deterministic rule-based ingredient analysis
- LLM-powered recommendation generation
- OCR pipelines
- product scraping
- personalized user profiles
- Supabase persistence
- deployed full-stack architecture
- AI assistant conversational interface

It demonstrates practical AI engineering, backend architecture, frontend UX, database design, and production deployment.

---

# Future Improvements

- Product recommendation retrieval from database
- Vector search using pgvector
- User authentication
- Product comparison
- Fake review detection
- Routine safety score
- Progress photo analysis
- Streaming AI chat responses

---

# Author

Built by Thrinath M  
B.Tech CSE AIML Student