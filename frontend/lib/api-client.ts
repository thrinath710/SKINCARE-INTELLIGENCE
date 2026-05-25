// frontend/lib/api-client.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    return data as T;
  } catch (error: any) {
    console.error('API Request Failed:', {
      path,
      error,
    });

    if (
      error?.message?.includes('Failed to fetch')
    ) {
      throw new Error(
        'Unable to connect to backend server.'
      );
    }

    throw error;
  }
}

// --- Ingredients ---
export const getIngredient = (inci_name: string) =>
  apiFetch<IngredientDetail>(
    `/api/v1/ingredients/${encodeURIComponent(inci_name)}`
  );

export const listIngredients = () =>
  apiFetch<IngredientDetail[]>(`/api/v1/ingredients/`);

// --- Analysis ---
export const analyzeIngredients = (ingredients: string[]) =>
  apiFetch<AnalysisResult>(
    `/api/v1/analysis/ingredients`,
    {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    }
  );

// --- Products ---
export const scrapeProduct = (url: string) =>
  apiFetch<Product>(
    `/api/v1/products/scrape`,
    {
      method: 'POST',
      body: JSON.stringify({ url }),
    }
  );

export const listProducts = () =>
  apiFetch<Product[]>(`/api/v1/products/`);

// --- OCR ---
export async function scanImage(
  formData: FormData
): Promise<OCRResult> {
  try {
    const response = await fetch(
      `${API_BASE}/api/v1/ocr/scan`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        'OCR scan failed'
      );
    }

    return data;
  } catch (error: any) {
    console.error('OCR Error:', error);

    throw new Error(
      error?.message ||
      'Failed to scan image'
    );
  }
}

// --- Recommendations ---
export const getRecommendation = (
  payload: RecommendationPayload
) =>
  apiFetch<any>(
    `/api/v1/recommendations/analyze`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

// --- Types ---
export interface IngredientDetail {
  id: string;
  inci_name: string;
  common_names?: string[];
  function?: string[];
  comedogenic_rating?: number;
  irritation_potential?: string;
  ph_min?: number;
  ph_max?: number;
  is_fragrance?: boolean;
  is_active?: boolean;
  notes?: string;
}

export interface ConflictResult {
  ingredient_a: string;
  ingredient_b: string;
  severity:
    | 'avoid'
    | 'time_separate'
    | 'caution';

  explanation: string;
  recommendation: string;
}

export interface AnalysisResult {
  conflicts: ConflictResult[];
  total_ingredients: number;
  actives_detected?: string[];
  comedogenic_score?: number;
  irritation_risk?: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  platform?: string;
  url?: string;
  image_url?: string;
  price_inr?: number;
  ingredients?: string[];
  rating?: number;
  review_count?: number;
}

export interface OCRResult {
  ingredients: string[];
  raw_text?: string;
  confidence?: number;
  method?: string;
}

export interface RecommendationPayload {
  ingredients: string[];
  skin_type?: string;
  skin_concerns?: string[];
  climate?: string;
  budget?: string;
}