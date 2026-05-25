from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.ingredients import router as ingredients_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.products import router as products_router
from app.api.v1.ocr import router as ocr_router
from app.api.v1.recommendations import router as recommendations_router

app = FastAPI(
    title="SkincareIQ API",
    version="1.0.0",
)

# Production + local frontend URLs
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://YOUR_VERCEL_URL.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

# API Routes
app.include_router(
    ingredients_router,
    prefix="/api/v1/ingredients",
    tags=["Ingredients"],
)

app.include_router(
    analysis_router,
    prefix="/api/v1/analysis",
    tags=["Analysis"],
)

app.include_router(
    products_router,
    prefix="/api/v1/products",
    tags=["Products"],
)

app.include_router(
    ocr_router,
    prefix="/api/v1/ocr",
    tags=["OCR"],
)

app.include_router(
    recommendations_router,
    prefix="/api/v1/recommendations",
    tags=["Recommendations"],
)