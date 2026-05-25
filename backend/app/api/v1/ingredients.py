from fastapi import APIRouter, HTTPException
from supabase import create_client
from app.core.config import settings

router = APIRouter()
supabase = create_client(settings.supabase_url, settings.supabase_anon_key)

@router.get("/{inci_name}")
async def get_ingredient(inci_name: str):
    result = supabase.table("ingredients")\
        .select("*")\
        .eq("inci_name", inci_name.upper())\
        .execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    return result.data[0]

@router.get("/")
async def list_ingredients(limit: int = 20):
    result = supabase.table("ingredients")\
        .select("*")\
        .limit(limit)\
        .execute()
    return result.data