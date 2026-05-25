// frontend/app/dashboard/search/page.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { scrapeProduct, listProducts, analyzeIngredients, Product } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Search,
  Star,
  ShoppingBag,
  FlaskConical,
  Plus,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

// --- Product card ---

function ProductCard({ product }: { product: Product }) {
  const addToRoutine = useAppStore((s) => s.addToRoutine);
  const [showIngredients, setShowIngredients] = useState(false);
  const [time, setTime] = useState<'morning' | 'evening'>('morning');

  const { mutate: analyze, data: analysis, isPending: analyzing } = useMutation({
    mutationFn: (ingredients: string[]) => analyzeIngredients(ingredients),
    onError: () => toast.error('Analysis failed.'),
  });

  const handleAnalyze = () => {
    if (!product.ingredients || product.ingredients.length === 0) {
      toast.error('No ingredients found for this product.');
      return;
    }
    analyze(product.ingredients);
    setShowIngredients(true);
  };

  const handleAddToRoutine = () => {
    addToRoutine(product, time);
    toast.success(`Added to ${time} routine.`);
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="pt-5">
        <div className="flex gap-4">

          {/* Image */}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-20 w-20 shrink-0 rounded-lg border border-slate-100 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <ShoppingBag className="h-8 w-8 text-slate-400" />
            </div>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 leading-tight">{product.name}</p>
            {product.brand && (
              <p className="mt-0.5 text-sm text-slate-500">{product.brand}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {product.price_inr && (
                <Badge variant="secondary">₹{product.price_inr}</Badge>
              )}
              {product.rating && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {product.rating}
                  {product.review_count && (
                    <span className="text-slate-400">({product.review_count})</span>
                  )}
                </span>
              )}
              {product.category && (
                <Badge variant="outline" className="capitalize">{product.category}</Badge>
              )}
            </div>
          </div>

          {/* External link */}
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <Separator className="my-4" />

        {/* Ingredient count */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="text-xs font-medium text-slate-500 underline hover:text-slate-700"
            >
              {showIngredients ? 'Hide' : 'Show'} {product.ingredients.length} ingredients
            </button>
            {showIngredients && (
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {product.ingredients.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Conflict summary */}
        {analysis && (
          <div className={`mb-3 rounded-lg border p-3 ${
            analysis.conflicts?.length > 0
              ? 'border-red-200 bg-red-50'
              : 'border-green-200 bg-green-50'
          }`}>
            <p className={`text-sm font-medium ${
              analysis.conflicts?.length > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              {analysis.conflicts?.length > 0
                ? `⚠️ ${analysis.conflicts.length} conflict(s) detected`
                : '✓ No conflicts detected'}
            </p>
            {analysis.conflicts?.slice(0, 2).map((c, i) => (
              <p key={i} className="mt-1 text-xs text-red-600">
                {c.ingredient_a.toLowerCase()} + {c.ingredient_b.toLowerCase()}
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
            {analyzing ? 'Analysing…' : 'Analyse'}
          </Button>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
            <button
              onClick={() => setTime('morning')}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                time === 'morning'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              AM
            </button>
            <button
              onClick={() => setTime('evening')}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                time === 'evening'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              PM
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleAddToRoutine}
            className="bg-slate-900 text-white hover:bg-slate-700"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add to Routine
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

// --- Main page ---

export default function SearchPage() {
  const [url, setUrl] = useState('');

  const { mutate: scrape, isPending: scraping } = useMutation({
    mutationFn: (url: string) => scrapeProduct(url),
    onSuccess: () => {
      toast.success('Product scraped successfully.');
      setUrl('');
      refetch();
    },
    onError: () => toast.error('Could not scrape product. Check the URL and try again.'),
  });

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  });

  const handleScrape = () => {
    if (!url.trim()) {
      toast.error('Please enter a Nykaa product URL.');
      return;
    }
    scrape(url.trim());
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Product Search</h2>
        <p className="mt-1 text-slate-500">
          Add a Nykaa product URL to analyse its ingredients
        </p>
      </div>

      {/* URL input */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-slate-500" />
            Add Product from Nykaa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="url"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            placeholder="https://www.nykaa.com/product-name/p/123456"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleScrape}
              disabled={scraping || !url.trim()}
              className="bg-slate-900 text-white hover:bg-slate-700"
            >
              {scraping ? 'Fetching…' : 'Fetch Product'}
            </Button>
            <p className="text-xs text-slate-400">
              Paste any Nykaa product page URL
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tip */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700">
          Nykaa blocks direct scraping. The backend uses their mobile API with a demo data fallback,
          so some fields may be approximate for unrecognised products.
        </p>
      </div>

      {/* Product list */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Saved Products
        </h3>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">
              No products yet. Add a Nykaa URL above.
            </p>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}