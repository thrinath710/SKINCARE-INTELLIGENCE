from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

ingredients = [
    {
        "inci_name": "NIACINAMIDE",
        "common_names": ["Vitamin B3", "Nicotinamide"],
        "function": ["brightening", "sebum_control", "barrier_repair"],
        "comedogenic_rating": 0,
        "irritation_potential": "low",
        "ph_min": 5.0,
        "ph_max": 7.0,
        "is_active": True,
        "notes": "Well-tolerated by most skin types. Reduces pore appearance, controls sebum."
    },
    {
        "inci_name": "ASCORBIC ACID",
        "common_names": ["Vitamin C", "L-Ascorbic Acid"],
        "function": ["antioxidant", "brightening", "collagen_synthesis"],
        "comedogenic_rating": 0,
        "irritation_potential": "medium",
        "ph_min": 2.5,
        "ph_max": 3.5,
        "is_active": True,
        "notes": "Requires pH below 3.5 to be effective. Unstable, oxidizes quickly."
    },
    {
        "inci_name": "RETINOL",
        "common_names": ["Vitamin A", "Retinol"],
        "function": ["anti_aging", "cell_turnover", "acne"],
        "comedogenic_rating": 0,
        "irritation_potential": "high",
        "ph_min": 5.0,
        "ph_max": 6.0,
        "is_active": True,
        "notes": "Use at night only. Start slow — 2-3x per week. Avoid with AHAs and BHAs."
    },
    {
        "inci_name": "GLYCOLIC ACID",
        "common_names": ["AHA", "Alpha Hydroxy Acid"],
        "function": ["exfoliant", "brightening", "anti_aging"],
        "comedogenic_rating": 0,
        "irritation_potential": "medium",
        "ph_min": 3.0,
        "ph_max": 4.0,
        "is_active": True,
        "notes": "Chemical exfoliant. Increases sun sensitivity — always use SPF."
    },
    {
        "inci_name": "SALICYLIC ACID",
        "common_names": ["BHA", "Beta Hydroxy Acid"],
        "function": ["exfoliant", "acne", "pore_cleansing"],
        "comedogenic_rating": 0,
        "irritation_potential": "medium",
        "ph_min": 3.0,
        "ph_max": 4.0,
        "is_active": True,
        "notes": "Oil-soluble, penetrates pores. Best for acne and blackheads."
    },
    {
        "inci_name": "HYALURONIC ACID",
        "common_names": ["HA", "Sodium Hyaluronate"],
        "function": ["humectant", "hydration"],
        "comedogenic_rating": 0,
        "irritation_potential": "low",
        "ph_min": 5.0,
        "ph_max": 8.0,
        "is_active": False,
        "notes": "Draws moisture into skin. Apply on damp skin for best results."
    },
    {
        "inci_name": "BENZOYL PEROXIDE",
        "common_names": ["BPO"],
        "function": ["acne", "antibacterial"],
        "comedogenic_rating": 0,
        "irritation_potential": "high",
        "ph_min": 4.0,
        "ph_max": 6.0,
        "is_active": True,
        "notes": "Kills acne bacteria. Do NOT use with retinol or hydroquinone."
    },
    {
        "inci_name": "ZINC OXIDE",
        "common_names": ["Zinc Oxide"],
        "function": ["sunscreen", "anti_inflammatory"],
        "comedogenic_rating": 0,
        "irritation_potential": "low",
        "ph_min": 5.0,
        "ph_max": 8.0,
        "is_active": False,
        "notes": "Mineral sunscreen. Broad spectrum UVA/UVB protection. Good for sensitive skin."
    },
    {
        "inci_name": "CERAMIDE NP",
        "common_names": ["Ceramide 3", "Ceramide"],
        "function": ["barrier_repair", "emollient"],
        "comedogenic_rating": 1,
        "irritation_potential": "low",
        "ph_min": 5.0,
        "ph_max": 7.0,
        "is_active": False,
        "notes": "Restores skin barrier. Excellent for dry and sensitive skin types."
    },
    {
        "inci_name": "DIMETHICONE",
        "common_names": ["Silicone", "Dimethicone"],
        "function": ["emollient", "occlusive", "texture"],
        "comedogenic_rating": 1,
        "irritation_potential": "low",
        "ph_min": 5.0,
        "ph_max": 8.0,
        "is_active": False,
        "notes": "Creates a protective layer. Non-comedogenic at typical concentrations."
    }
]

result = supabase.table("ingredients").insert(ingredients).execute()
print(f"Inserted {len(result.data)} ingredients successfully!")