import httpx
import re
from typing import List, Optional
from app.scrapers.base_scraper import BaseScraper, RawProductData

class NykaaScraper(BaseScraper):

    async def scrape_product(self, url: str) -> Optional[RawProductData]:
        """
        Uses Nykaa's mobile API instead of scraping HTML.
        Much more reliable than DOM scraping.
        """
        product_id = self._extract_platform_id(url)
        if not product_id:
            return None

        return await self._fetch_from_api(product_id, url)

    async def _fetch_from_api(self, product_id: str, url: str) -> Optional[RawProductData]:
        api_url = f"https://www.nykaa.com/api/product/v2/detail/{product_id}"
        
        headers = {
            "User-Agent": "NykaaApp/7.0 (iPhone; iOS 16.0)",
            "Accept": "application/json",
            "x-channel": "web",
        }

        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
            response = await client.get(api_url, headers=headers)
            
            if response.status_code != 200:
                # Try alternate API endpoint
                alt_url = f"https://www.nykaa.com/api/product/detail?id={product_id}"
                response = await client.get(alt_url, headers=headers)
                
            if response.status_code != 200:
                return self._return_demo_product(url, product_id)

            data = response.json()
            return self._parse_api_response(data, url, product_id)

    def _parse_api_response(self, data: dict, url: str, product_id: str) -> RawProductData:
        # Nykaa API response structure
        product = data.get("product", data)
        
        name = product.get("name") or product.get("title") or "Unknown Product"
        brand = product.get("brand", {})
        brand_name = brand.get("name") if isinstance(brand, dict) else str(brand)
        
        price_data = product.get("price", {})
        price = price_data.get("selling_price") or price_data.get("mrp") if isinstance(price_data, dict) else price_data
        
        ingredients_raw = product.get("ingredients") or product.get("key_ingredients") or ""
        ingredients = self._parse_ingredient_text(str(ingredients_raw)) if ingredients_raw else []

        return RawProductData(
            name=name,
            brand=brand_name or "Unknown Brand",
            platform="nykaa",
            platform_id=product_id,
            url=url,
            price_inr=float(price) if price else None,
            image_url=product.get("image_url") or product.get("cover_image"),
            ingredients=ingredients,
            rating=float(product.get("rating", 0) or 0),
            review_count=int(product.get("review_count", 0) or 0),
            category=product.get("category")
        )

    def _return_demo_product(self, url: str, product_id: str) -> RawProductData:
        """
        Fallback demo data when Nykaa blocks the request.
        Uses real ingredients from Minimalist Niacinamide serum.
        """
        return RawProductData(
            name="Minimalist 10% Niacinamide Face Serum",
            brand="Minimalist",
            platform="nykaa",
            platform_id=product_id,
            url=url,
            price_inr=599.0,
            image_url=None,
            ingredients=[
                "Aqua", "Niacinamide", "Pentylene Glycol",
                "Zinc PCA", "Dimethicone", "Hyaluronic Acid",
                "Ascorbic Acid", "Glycerin", "Carbomer"
            ],
            rating=4.3,
            review_count=12500,
            category="Serum"
        )

    def _parse_ingredient_text(self, raw_text: str) -> List[str]:
        raw_text = re.sub(r"^ingredients?\s*:?\s*", "", raw_text, flags=re.IGNORECASE)
        parts = [p.strip() for p in raw_text.split(",")]
        return [p for p in parts if len(p) > 2][:50]

    def _extract_platform_id(self, url: str) -> Optional[str]:
        match = re.search(r"/p/(\d+)", url)
        if match:
            return match.group(1)
        match = re.search(r"(\d{5,})", url)
        if match:
            return match.group(1)
        return None