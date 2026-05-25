from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from groq import Groq
from app.core.config import settings

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = []
    climate_zone: Optional[str] = None
    budget_range: Optional[str] = None


@router.post("/")
async def chat_with_ai(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    try:
        client = Groq(
            api_key=settings.GROQ_API_KEY
        )

        prompt = f"""
You are SkincareIQ AI, an expert skincare assistant.

User Profile:
- Skin Type: {request.skin_type}
- Skin Concerns: {request.skin_concerns}
- Climate Zone: {request.climate_zone}
- Budget Range: {request.budget_range}

User Question:
{request.message}

Rules:
- Give evidence-based skincare advice
- Explain ingredients simply
- Be practical and concise
- Focus on Indian skin and climate
- Avoid medical diagnosis
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert skincare AI assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=700,
        )

        answer = response.choices[0].message.content

        return {
            "response": answer
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI assistant failed: {str(e)}"
        )