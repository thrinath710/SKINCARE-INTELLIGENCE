from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    upstash_redis_rest_url: str
    upstash_redis_rest_token: str
    anthropic_api_key: str = ""
    groq_api_key: str = ""

    class Config:
        env_file = Path(__file__).parent.parent.parent / ".env"

settings = Settings()