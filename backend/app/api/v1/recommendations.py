from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.engines.ingredient_engine import IngredientEngine
from app.pipelines.llm_pipeline import LLMPipeline

router = APIRouter()
engine = IngredientEngine()
llm = LLMPipeline()

class RecommendationRequest(BaseModel):
    ingredients: List[str]
    skin_type: Optional[str] = "combination"
    skin_concerns: Optional[List[str]] = ["hyperpigmentation", "acne"]
    climate: Optional[str] = "humid"
    budget: Optional[str] = "mid-range"

@router.post("/analyze")
async def get_recommendation(request: RecommendationRequest):
    """
    Full pipeline:
    1. Run ingredient engine (deterministic, fast)
    2. Send results to Groq for human-readable recommendations
    3. Return combined response
    """

    # Step 1 — Ingredient Engine (no API call, instant)
    analysis = engine.analyze(request.ingredients)

    # Step 2 — Format conflicts for LLM
    conflicts_for_llm = [
        {
            "ingredient_a": c.ingredient_a,
            "ingredient_b": c.ingredient_b,
            "severity": c.severity,
            "explanation": c.explanation,
        }
        for c in analysis.conflicts
    ]

    # Step 3 — LLM recommendation
    llm_response = llm.get_recommendation(
        ingredients=request.ingredients,
        conflicts=conflicts_for_llm,
        skin_type=request.skin_type,
        skin_concerns=request.skin_concerns,
        climate=request.climate,
        budget=request.budget
    )

    # Step 4 — Combined response
    return {
        "ingredient_analysis": {
            "total_ingredients": analysis.total_ingredients,
            "actives_detected": analysis.actives_detected,
            "comedogenic_score": analysis.comedogenic_score,
            "irritation_risk": analysis.irritation_risk,
            "conflicts": conflicts_for_llm,
            "skin_type_suitability": analysis.skin_type_suitability,
            "warnings": analysis.warnings,
        },
        "ai_recommendation": llm_response
    }