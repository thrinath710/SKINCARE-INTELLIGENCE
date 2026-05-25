from dataclasses import dataclass
from typing import List, Optional

@dataclass
class RawProductData:
    name: str
    brand: str
    platform: str
    platform_id: str
    url: str
    price_inr: Optional[float]
    image_url: Optional[str]
    ingredients: List[str]
    rating: Optional[float]
    review_count: Optional[int]
    category: Optional[str]

class BaseScraper:
    async def scrape_product(self, url: str) -> RawProductData:
        raise NotImplementedError
    
    async def search_products(self, query: str, max_results: int = 10) -> List[RawProductData]:
        raise NotImplementedError