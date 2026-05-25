import json
import hashlib
from groq import Groq
from app.core.config import settings

SYSTEM_PROMPT = """You are an evidence-based skincare advisor with deep knowledge of:
- Cosmetic chemistry and ingredient interactions
- Indian skin types (Fitzpatrick III-VI)
- Indian climate zones (humid coastal, dry inland, tropical)
- Common Indian skin concerns: hyperpigmentation, melasma, acne, oiliness in humid weather

You reason from ingredient science, not marketing claims.
You always respond with valid JSON only — no markdown, no extra text, just the JSON object.
Be specific about WHY an ingredient matters, not just that it does.
Keep advice practical and relevant to Indian users."""

class LLMPipeline:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"

    def get_recommendation(
        self,
        ingredients: list,
        conflicts: list,
        skin_type: str = "combination",
        skin_concerns: list = None,
        climate: str = "humid",
        budget: str = "mid-range"
    ) -> dict:
        """
        Send ingredient analysis to Groq and get back
        structured skincare recommendations.
        """
        if skin_concerns is None:
            skin_concerns = ["hyperpigmentation", "acne"]

        prompt = self._build_prompt(
            ingredients, conflicts, skin_type, skin_concerns, climate, budget
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,      # Low temperature = more consistent, factual responses
                max_tokens=1500,
            )

            raw = response.choices[0].message.content.strip()
            return self._parse_response(raw)

        except Exception as e:
            return self._fallback_response(str(e))

    def _build_prompt(
        self,
        ingredients: list,
        conflicts: list,
        skin_type: str,
        skin_concerns: list,
        climate: str,
        budget: str
    ) -> str:
        conflicts_text = ""
        if conflicts:
            conflicts_text = "\n".join([
                f"- {c['ingredient_a']} + {c['ingredient_b']}: {c['severity']} ({c['explanation']})"
                for c in conflicts
            ])
        else:
            conflicts_text = "No conflicts detected"

        return f"""Analyze this skincare product for an Indian user.

PRODUCT INGREDIENTS:
{', '.join(ingredients)}

PRE-COMPUTED CONFLICTS:
{conflicts_text}

USER PROFILE:
- Skin type: {skin_type}
- Skin concerns: {', '.join(skin_concerns)}
- Climate: {climate} (India)
- Budget preference: {budget}

Respond with ONLY this JSON structure, no other text:
{{
    "overall_rating": "good/average/poor",
    "summary": "2-3 sentence plain English summary of this product for this user",
    "key_ingredients": [
        {{
            "name": "ingredient name",
            "benefit": "what it does",
            "relevance_to_user": "why it matters for this specific user's concerns"
        }}
    ],
    "conflicts_explained": [
        {{
            "pair": "Ingredient A + Ingredient B",
            "what_happens": "plain English explanation",
            "what_to_do": "practical advice"
        }}
    ],
    "routine_placement": {{
        "time_of_day": "morning/evening/both",
        "step": "cleanser/toner/serum/moisturizer/sunscreen",
        "before": "what to apply before this",
        "after": "what to apply after this"
    }},
    "india_specific_notes": "advice specific to Indian climate, skin tone, or common concerns",
    "warnings": ["warning 1", "warning 2"],
    "verdict": "one sentence bottom line for this user"
}}"""

    def _parse_response(self, raw: str) -> dict:
        """
        Parse JSON response from Groq.
        Handles cases where the model adds extra text around the JSON.
        """
        # Find JSON object in the response
        start = raw.find("{")
        end = raw.rfind("}") + 1

        if start == -1 or end == 0:
            return self._fallback_response("No JSON found in response")

        json_str = raw[start:end]

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            return self._fallback_response(f"JSON parse error: {e}")

    def _fallback_response(self, error: str) -> dict:
        """
        Return a safe fallback when LLM call fails.
        This way the API never crashes even if Groq is down.
        """
        return {
            "overall_rating": "unknown",
            "summary": "Analysis temporarily unavailable. Please try again.",
            "key_ingredients": [],
            "conflicts_explained": [],
            "routine_placement": {
                "time_of_day": "unknown",
                "step": "unknown",
                "before": "unknown",
                "after": "unknown"
            },
            "india_specific_notes": "",
            "warnings": [],
            "verdict": "Please try again later.",
            "error": error
        }
