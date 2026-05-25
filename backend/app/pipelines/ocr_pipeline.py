import io
import re
import base64
from typing import List
from dataclasses import dataclass
from PIL import Image, ImageEnhance, ImageFilter

@dataclass
class OCRResult:
    raw_text: str
    ingredients: List[str]
    confidence: float
    method: str

class OCRPipeline:

    def process_image(self, image_bytes: bytes) -> OCRResult:
        """
        Two-stage OCR:
        1. Tesseract (free, local) — used first
        2. Falls back with enhanced preprocessing if confidence is low
        """
        try:
            import pytesseract
        except ImportError:
            return OCRResult(
                raw_text="",
                ingredients=[],
                confidence=0.0,
                method="unavailable"
            )

        # Preprocess the image for better OCR accuracy
        processed_image = self._preprocess_image(image_bytes)

        # Run Tesseract
        raw_text = pytesseract.image_to_string(processed_image)
        confidence = self._estimate_confidence(raw_text)

        if confidence < 0.5:
            # Try with more aggressive preprocessing
            enhanced_image = self._enhance_aggressively(image_bytes)
            raw_text = pytesseract.image_to_string(enhanced_image)
            confidence = self._estimate_confidence(raw_text)

        ingredients = self._extract_ingredients(raw_text)

        return OCRResult(
            raw_text=raw_text,
            ingredients=ingredients,
            confidence=confidence,
            method="tesseract"
        )

    def _preprocess_image(self, image_bytes: bytes) -> Image.Image:
        """
        Basic preprocessing to improve OCR accuracy:
        - Convert to grayscale
        - Increase contrast
        - Sharpen
        - Resize if too small
        """
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to grayscale
        image = image.convert("L")

        # Increase contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)

        # Sharpen
        image = image.filter(ImageFilter.SHARPEN)

        # Resize if too small (OCR works better on larger images)
        width, height = image.size
        if width < 1000:
            scale = 1000 / width
            image = image.resize(
                (int(width * scale), int(height * scale)),
                Image.LANCZOS
            )

        return image

    def _enhance_aggressively(self, image_bytes: bytes) -> Image.Image:
        """More aggressive preprocessing for difficult images."""
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("L")

        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(3.0)

        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(2.0)

        return image

    def _estimate_confidence(self, text: str) -> float:
        """
        Estimate OCR confidence based on the quality of extracted text.
        Real confidence scoring would use pytesseract.image_to_data,
        but this heuristic works well for ingredient lists.
        """
        if not text or len(text.strip()) < 20:
            return 0.0

        # Check for ingredient-related keywords
        ingredient_keywords = ["ingredients", "aqua", "water", "extract", "acid", "glycerin"]
        found = sum(1 for kw in ingredient_keywords if kw.lower() in text.lower())

        # More keywords = higher confidence
        confidence = min(found / 3, 1.0)

        # Penalize if too many special characters (usually means bad OCR)
        special_chars = len(re.findall(r"[^a-zA-Z0-9\s,\.\(\)\-]", text))
        total_chars = len(text)
        if total_chars > 0:
            special_ratio = special_chars / total_chars
            confidence -= special_ratio * 0.5

        return max(0.0, round(confidence, 2))

    def _extract_ingredients(self, raw_text: str) -> List[str]:
        """
        Find and parse the ingredients section from OCR text.
        """
        # Find ingredients section
        match = re.search(
            r"ingredients?\s*[:\-]?\s*(.*?)(?:caution|warning|how to use|directions|$)",
            raw_text,
            re.IGNORECASE | re.DOTALL
        )

        if not match:
            return []

        ingredients_text = match.group(1).strip()

        # Split by comma and clean up
        parts = [p.strip() for p in ingredients_text.split(",")]
        ingredients = [p for p in parts if 2 < len(p) < 100]

        return ingredients[:50]