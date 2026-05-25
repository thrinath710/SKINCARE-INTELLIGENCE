from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client

from app.core.config import settings
from app.engines.ingredient_engine import IngredientEngine

router = APIRouter()

supabase = create_client(
    settings.supabase_url,
    settings.supabase_anon_key
)

engine = IngredientEngine()


class ManualProductRequest(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    price_inr: Optional[float] = None
    ingredients: List[str]
    image_url: Optional[str] = None
    url: Optional[str] = None


@router.post("/manual")
async def create_manual_product(request: ManualProductRequest):

    if len(request.ingredients) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one ingredient is required."
        )

    analysis = engine.analyze(request.ingredients)

    inserted = supabase.table("products").insert({
        "name": request.name,
        "brand": request.brand,
        "category": request.category,
        "platform": "manual",
        "url": request.url,
        "image_url": request.image_url,
        "price_inr": request.price_inr,
        "ingredients": request.ingredients,
        "rating": None,
        "review_count": None,
    }).execute()

    saved_product = inserted.data[0]

    return {
        "product": saved_product,
        "analysis": {
            "total_ingredients": analysis.total_ingredients,
            "actives_detected": analysis.actives_detected,
            "conflicts": [
                {
                    "ingredient_a": c.ingredient_a,
                    "ingredient_b": c.ingredient_b,
                    "severity": c.severity,
                    "explanation": c.explanation,
                    "recommendation": c.recommendation,
                }
                for c in analysis.conflicts
            ],
            "irritation_risk": analysis.irritation_risk,
            "warnings": analysis.warnings,
        }
    }


@router.get("/")
async def list_products(limit: int = 50):

    result = (
        supabase
        .table("products")
        .select("*")
        .order("id", desc=True)
        .limit(limit)
        .execute()
    )

    return result.data