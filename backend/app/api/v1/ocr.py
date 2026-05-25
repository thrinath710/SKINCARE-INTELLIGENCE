from fastapi import APIRouter, UploadFile, File, HTTPException
from app.pipelines.ocr_pipeline import OCRPipeline
from app.engines.ingredient_engine import IngredientEngine

router = APIRouter()
pipeline = OCRPipeline()
engine = IngredientEngine()

@router.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    """
    Upload a product label image.
    Returns extracted ingredients + full analysis.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    ocr_result = pipeline.process_image(image_bytes)

    if not ocr_result.ingredients:
        return {
            "success": False,
            "message": "No ingredients found in image. Try a clearer photo of the ingredients list.",
            "raw_text": ocr_result.raw_text,
            "confidence": ocr_result.confidence,
        }

    analysis = engine.analyze(ocr_result.ingredients)

    return {
        "success": True,
        "ocr": {
            "confidence": ocr_result.confidence,
            "method": ocr_result.method,
            "raw_text": ocr_result.raw_text[:500],
        },
        "ingredients": ocr_result.ingredients,
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