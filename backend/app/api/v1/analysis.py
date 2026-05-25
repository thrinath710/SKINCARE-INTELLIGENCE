from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.engines.ingredient_engine import IngredientEngine

router = APIRouter()
engine = IngredientEngine()

class IngredientListRequest(BaseModel):
    ingredients: List[str]

@router.post("/ingredients")
async def analyze_ingredients(request: IngredientListRequest):
    """
    Send a list of ingredient names, get back a full conflict and risk analysis.
    """
    analysis = engine.analyze(request.ingredients)
    
    return {
        "total_ingredients": analysis.total_ingredients,
        "actives_detected": analysis.actives_detected,
        "comedogenic_score": analysis.comedogenic_score,
        "irritation_risk": analysis.irritation_risk,
        "conflicts": [
            {
                "ingredient_a": c.ingredient_a,
                "ingredient_b": c.ingredient_b,
                "severity": c.severity,
                "conflict_type": c.conflict_type,
                "explanation": c.explanation,
                "recommendation": c.recommendation,
                "time_separation_hours": c.time_separation_hours
            }
            for c in analysis.conflicts
        ],
        "skin_type_suitability": analysis.skin_type_suitability,
        "warnings": analysis.warnings
    }