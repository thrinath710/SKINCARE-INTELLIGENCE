from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from app.core.config import settings
from app.scrapers.nykaa_scraper import NykaaScraper
from app.engines.ingredient_engine import IngredientEngine

router = APIRouter()
supabase = create_client(settings.supabase_url, settings.supabase_anon_key)
scraper = NykaaScraper()
engine = IngredientEngine()

class ScrapeRequest(BaseModel):
    url: str

@router.post("/scrape")
async def scrape_product(request: ScrapeRequest):
    """
    Scrape a Nykaa product URL and return product data + ingredient analysis.
    """
    if "nykaa.com" not in request.url:
        raise HTTPException(status_code=400, detail="Only Nykaa URLs are supported right now")

    # Scrape the product
    product = await scraper.scrape_product(request.url)

    if not product:
        raise HTTPException(status_code=404, detail="Could not scrape product")

    # Run ingredient analysis if ingredients were found
    analysis = None
    if product.ingredients:
        analysis = engine.analyze(product.ingredients)

    # Save to Supabase
    saved = supabase.table("products").upsert({
        "name": product.name,
        "brand": product.brand,
        "platform": product.platform,
        "platform_id": product.platform_id,
        "url": product.url,
        "image_url": product.image_url,
        "price_inr": product.price_inr,
        "ingredients": product.ingredients,
        "rating": product.rating,
        "review_count": product.review_count,
    }).execute()

    return {
        "product": {
            "name": product.name,
            "brand": product.brand,
            "price_inr": product.price_inr,
            "rating": product.rating,
            "review_count": product.review_count,
            "ingredients": product.ingredients,
            "image_url": product.image_url,
        },
        "analysis": {
            "total_ingredients": analysis.total_ingredients if analysis else 0,
            "actives_detected": analysis.actives_detected if analysis else [],
            "conflicts": [
                {
                    "ingredient_a": c.ingredient_a,
                    "ingredient_b": c.ingredient_b,
                    "severity": c.severity,
                    "explanation": c.explanation,
                    "recommendation": c.recommendation,
                }
                for c in analysis.conflicts
            ] if analysis else [],
            "irritation_risk": analysis.irritation_risk if analysis else "unknown",
            "warnings": analysis.warnings if analysis else [],
        } if analysis else None
    }

@router.get("/")
async def list_products(limit: int = 20):
    result = supabase.table("products").select("*").limit(limit).execute()
    return result.data