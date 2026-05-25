import pytest
from app.engines.ingredient_engine import IngredientEngine

engine = IngredientEngine()

def test_detects_vitamin_c_niacinamide_conflict():
    analysis = engine.analyze(["Ascorbic Acid", "Niacinamide"])
    conflict_pairs = [(c.ingredient_a, c.ingredient_b) for c in analysis.conflicts]
    assert any(
        {"ASCORBIC ACID", "NIACINAMIDE"} == {a, b}
        for a, b in conflict_pairs
    )

def test_detects_retinol_glycolic_conflict():
    analysis = engine.analyze(["Retinol", "Glycolic Acid"])
    assert len(analysis.conflicts) > 0
    assert analysis.conflicts[0].severity == "avoid"

def test_safe_combination_has_no_conflicts():
    analysis = engine.analyze(["Hyaluronic Acid", "Ceramide NP", "Dimethicone"])
    assert len(analysis.conflicts) == 0
    assert analysis.irritation_risk == "low"

def test_identifies_actives_correctly():
    analysis = engine.analyze(["Retinol", "Niacinamide", "Hyaluronic Acid", "Dimethicone"])
    assert "RETINOL" in analysis.actives_detected
    assert "NIACINAMIDE" in analysis.actives_detected
    assert "HYALURONIC ACID" not in analysis.actives_detected

def test_high_irritation_risk_with_avoid_conflict():
    analysis = engine.analyze(["Retinol", "Glycolic Acid"])
    assert analysis.irritation_risk == "high"

def test_comedogenic_score_is_zero_for_safe_ingredients():
    analysis = engine.analyze(["Niacinamide", "Ascorbic Acid", "Hyaluronic Acid"])
    assert analysis.comedogenic_score == 0.0