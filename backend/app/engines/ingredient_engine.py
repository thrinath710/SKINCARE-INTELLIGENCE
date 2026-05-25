import json
from dataclasses import dataclass, field
from typing import List, Tuple, Dict
from enum import Enum
from pathlib import Path

class ConflictSeverity(Enum):
    AVOID = "avoid"
    TIME_SEPARATE = "time_separate"
    CAUTION = "caution"

@dataclass
class ConflictResult:
    ingredient_a: str
    ingredient_b: str
    severity: str
    conflict_type: str
    explanation: str
    recommendation: str
    time_separation_hours: int

@dataclass
class IngredientAnalysis:
    total_ingredients: int
    actives_detected: List[str]
    comedogenic_score: float
    irritation_risk: str
    conflicts: List[ConflictResult]
    skin_type_suitability: Dict[str, float]
    warnings: List[str]

# These are our known actives
KNOWN_ACTIVES = {
    "ASCORBIC ACID", "RETINOL", "GLYCOLIC ACID", "SALICYLIC ACID",
    "NIACINAMIDE", "BENZOYL PEROXIDE", "LACTIC ACID", "AZELAIC ACID",
    "KOJIC ACID", "ALPHA ARBUTIN", "TRANEXAMIC ACID"
}

# Comedogenic ratings for our seeded ingredients
COMEDOGENIC_RATINGS = {
    "NIACINAMIDE": 0,
    "ASCORBIC ACID": 0,
    "RETINOL": 0,
    "GLYCOLIC ACID": 0,
    "SALICYLIC ACID": 0,
    "HYALURONIC ACID": 0,
    "BENZOYL PEROXIDE": 0,
    "ZINC OXIDE": 0,
    "CERAMIDE NP": 1,
    "DIMETHICONE": 1,
}

# Irritation levels per ingredient
IRRITATION_LEVELS = {
    "NIACINAMIDE": 1,
    "ASCORBIC ACID": 2,
    "RETINOL": 3,
    "GLYCOLIC ACID": 2,
    "SALICYLIC ACID": 2,
    "HYALURONIC ACID": 1,
    "BENZOYL PEROXIDE": 3,
    "ZINC OXIDE": 1,
    "CERAMIDE NP": 1,
    "DIMETHICONE": 1,
}

class IngredientEngine:
    def __init__(self):
        self._conflict_matrix = self._load_conflict_matrix()

    def _load_conflict_matrix(self) -> Dict:
        """
        Load conflict rules from JSON into memory as a dict of frozensets.
        frozenset means the order of ingredients doesn't matter —
        frozenset(A, B) == frozenset(B, A). This gives O(1) lookups.
        """
        rules_path = Path(__file__).parent.parent.parent.parent / "data" / "ingredients" / "conflict_rules.json"
        
        with open(rules_path, "r") as f:
            data = json.load(f)
        
        matrix = {}
        for rule in data["conflicts"]:
            key = frozenset([rule["ingredient_a"], rule["ingredient_b"]])
            matrix[key] = rule
        
        return matrix

    def analyze(self, ingredient_list: List[str]) -> IngredientAnalysis:
        """
        Main analysis function.
        Takes a list of ingredient names, returns full analysis.
        """
        # Normalize to uppercase for consistent matching
        normalized = [ing.strip().upper() for ing in ingredient_list]

        conflicts = self._detect_conflicts(normalized)
        actives = self._identify_actives(normalized)
        comedogenic_score = self._calculate_comedogenic_score(normalized)
        irritation_risk = self._assess_irritation_risk(normalized, conflicts)
        skin_suitability = self._score_skin_type_suitability(normalized, conflicts)
        warnings = self._generate_warnings(normalized, conflicts, actives)

        return IngredientAnalysis(
            total_ingredients=len(normalized),
            actives_detected=actives,
            comedogenic_score=comedogenic_score,
            irritation_risk=irritation_risk,
            conflicts=conflicts,
            skin_type_suitability=skin_suitability,
            warnings=warnings
        )

    def _detect_conflicts(self, ingredients: List[str]) -> List[ConflictResult]:
        """
        Check every pair of ingredients against the conflict matrix.
        O(n²) pairs but O(1) lookup per pair.
        """
        conflicts = []
        for i, ing_a in enumerate(ingredients):
            for ing_b in ingredients[i+1:]:
                pair_key = frozenset([ing_a, ing_b])
                if pair_key in self._conflict_matrix:
                    rule = self._conflict_matrix[pair_key]
                    conflicts.append(ConflictResult(
                        ingredient_a=ing_a,
                        ingredient_b=ing_b,
                        severity=rule["severity"],
                        conflict_type=rule["conflict_type"],
                        explanation=rule["explanation"],
                        recommendation=rule["recommendation"],
                        time_separation_hours=rule["time_separation_hours"]
                    ))
        return conflicts

    def _identify_actives(self, ingredients: List[str]) -> List[str]:
        return [ing for ing in ingredients if ing in KNOWN_ACTIVES]

    def _calculate_comedogenic_score(self, ingredients: List[str]) -> float:
        """
        Average comedogenic rating of all known ingredients.
        0 = non-comedogenic, 5 = highly comedogenic.
        """
        ratings = [COMEDOGENIC_RATINGS[ing] for ing in ingredients if ing in COMEDOGENIC_RATINGS]
        if not ratings:
            return 0.0
        return round(sum(ratings) / len(ratings), 2)

    def _assess_irritation_risk(self, ingredients: List[str], conflicts: List[ConflictResult]) -> str:
        """
        Overall irritation risk: low / medium / high
        Based on individual ingredient irritation levels + conflicts found.
        """
        levels = [IRRITATION_LEVELS[ing] for ing in ingredients if ing in IRRITATION_LEVELS]
        
        if not levels:
            return "low"

        avg = sum(levels) / len(levels)
        avoid_conflicts = [c for c in conflicts if c.severity == "avoid"]

        if avoid_conflicts or avg >= 2.5:
            return "high"
        elif avg >= 1.5:
            return "medium"
        return "low"

    def _score_skin_type_suitability(self, ingredients: List[str], conflicts: List[ConflictResult]) -> Dict[str, float]:
        """
        How suitable is this ingredient combination for each skin type.
        Score from 0 (not suitable) to 1 (very suitable).
        """
        # Start with base scores
        scores = {"dry": 0.8, "oily": 0.8, "combination": 0.8, "sensitive": 0.8, "normal": 0.9}

        # Adjust based on actives present
        if "RETINOL" in ingredients:
            scores["sensitive"] -= 0.3
            scores["dry"] -= 0.1

        if "GLYCOLIC ACID" in ingredients:
            scores["sensitive"] -= 0.3
            scores["dry"] -= 0.1

        if "BENZOYL PEROXIDE" in ingredients:
            scores["sensitive"] -= 0.3
            scores["dry"] -= 0.2

        if "SALICYLIC ACID" in ingredients:
            scores["oily"] += 0.1
            scores["combination"] += 0.1

        if "NIACINAMIDE" in ingredients:
            scores["oily"] += 0.1
            scores["sensitive"] += 0.1

        if "CERAMIDE NP" in ingredients:
            scores["dry"] += 0.1
            scores["sensitive"] += 0.1

        if "HYALURONIC ACID" in ingredients:
            scores["dry"] += 0.1

        # Penalize for severe conflicts
        avoid_conflicts = [c for c in conflicts if c.severity == "avoid"]
        scores = {k: max(0.0, v - (0.2 * len(avoid_conflicts))) for k, v in scores.items()}

        # Cap at 1.0
        return {k: min(1.0, round(v, 2)) for k, v in scores.items()}

    def _generate_warnings(self, ingredients: List[str], conflicts: List[ConflictResult], actives: List[str]) -> List[str]:
        warnings = []

        if "RETINOL" in ingredients:
            warnings.append("Retinol increases sun sensitivity — always use SPF in the morning.")
        
        if "GLYCOLIC ACID" in ingredients or "SALICYLIC ACID" in ingredients:
            warnings.append("AHAs/BHAs increase photosensitivity — daily SPF is essential.")

        if "ASCORBIC ACID" in ingredients:
            warnings.append("Vitamin C (L-Ascorbic Acid) is unstable and oxidizes quickly. Store in a cool, dark place.")

        if len(actives) >= 3:
            warnings.append(f"You have {len(actives)} actives in this product. This may be too much for daily use — consider alternating.")

        for conflict in conflicts:
            if conflict.severity == "avoid":
                warnings.append(f"⚠️ AVOID combining {conflict.ingredient_a} and {conflict.ingredient_b}: {conflict.explanation}")

        return warnings