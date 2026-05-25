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
    if not request.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Product name is required."
        )

    if len(request.ingredients) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one ingredient is required."
        )

    cleaned_ingredients = [
        ingredient.strip()
        for ingredient in request.ingredients
        if ingredient.strip()
    ]

    if len(cleaned_ingredients) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one valid ingredient is required."
        )

    analysis = engine.analyze(cleaned_ingredients)

    inserted = supabase.table("products").insert({
        "name": request.name.strip(),
        "brand": request.brand.strip() if request.brand else None,
        "category": request.category.strip() if request.category else None,
        "platform": "manual",
        "url": request.url,
        "image_url": request.image_url,
        "price_inr": request.price_inr,
        "ingredients": cleaned_ingredients,
        "rating": None,
        "review_count": None,
    }).execute()

    if not inserted.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to save product."
        )

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
        .limit(limit)
        .execute()
    )

    return result.data


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    result = (
        supabase
        .table("products")
        .delete()
        .eq("id", product_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Product not found or already deleted."
        )

    return {
        "message": "Product deleted successfully.",
        "deleted_product": result.data[0]
    }