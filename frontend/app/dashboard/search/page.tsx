'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  listProducts,
  Product,
} from '@/lib/api-client';

import { useAppStore } from '@/lib/store';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Search,
  ShoppingBag,
  Plus,
  ExternalLink,
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';

import { toast } from 'sonner';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

function buildSearchUrl(
  platform: 'nykaa' | 'amazon' | 'google',
  query: string
) {
  const encoded = encodeURIComponent(query.trim());

  if (platform === 'nykaa') {
    return `https://www.nykaa.com/search/result/?q=${encoded}`;
  }

  if (platform === 'amazon') {
    return `https://www.amazon.in/s?k=${encoded}`;
  }

  return `https://www.google.com/search?q=${encoded}+ingredients+skincare`;
}

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </label>
  );
}

function ProductCard({
  product,
  onDeleted,
}: {
  product: Product;
  onDeleted: () => void;
}) {
  const addToRoutine = useAppStore((s) => s.addToRoutine);

  const [timeOfDay, setTimeOfDay] =
    useState<'morning' | 'evening'>('morning');

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${API_BASE}/api/v1/products/${product.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete product');
      }

      return response.json();
    },

    onSuccess: () => {
      toast.success('Product deleted.');
      onDeleted();
    },

    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete product.');
    },
  });

  const handleAddToRoutine = () => {
    addToRoutine(product, timeOfDay);

    toast.success(
      `Added to ${timeOfDay === 'morning' ? 'AM' : 'PM'} routine.`
    );
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${product.name}" from saved products?`
    );

    if (!confirmed) return;

    deleteMutation.mutate();
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="space-y-4 pt-5">

        <div className="flex items-start gap-4">

          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-16 w-16 shrink-0 rounded-xl border border-slate-100 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <ShoppingBag className="h-7 w-7 text-slate-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">

            <p className="font-semibold leading-tight text-slate-900">
              {product.name}
            </p>

            {product.brand && (
              <p className="mt-0.5 text-sm text-slate-500">
                {product.brand}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">

              {product.price_inr && (
                <Badge variant="secondary">
                  ₹{product.price_inr}
                </Badge>
              )}

              {product.category && (
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
              )}

              {product.ingredients && product.ingredients.length > 0 && (
                <Badge variant="outline">
                  {product.ingredients.length} ingredients
                </Badge>
              )}

            </div>

          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

        </div>

        {product.ingredients && product.ingredients.length > 0 && (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ingredients
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {product.ingredients.join(', ')}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">

            <button
              onClick={() => setTimeOfDay('morning')}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                timeOfDay === 'morning'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              AM
            </button>

            <button
              onClick={() => setTimeOfDay('evening')}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                timeOfDay === 'evening'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
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

export default function SearchPage() {
  const [onlineSearch, setOnlineSearch] = useState('');

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const parsedIngredients = ingredients
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const response = await fetch(
        `${API_BASE}/api/v1/products/manual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productName.trim(),
            brand: brand.trim() || null,
            category: category.trim() || null,
            price_inr: price ? Number(price) : null,
            ingredients: parsedIngredients,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save product');
      }

      return response.json();
    },

    onSuccess: () => {
      toast.success('Product saved successfully.');

      setProductName('');
      setBrand('');
      setCategory('');
      setPrice('');
      setIngredients('');

      refetch();
    },

    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save product.');
    },
  });

  const handleSaveProduct = () => {
    if (!productName.trim()) {
      toast.error('Enter product name.');
      return;
    }

    const parsedIngredients = ingredients
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (parsedIngredients.length === 0) {
      toast.error('Enter at least one ingredient.');
      return;
    }

    createMutation.mutate();
  };

  const canOpenSearch = onlineSearch.trim().length > 0;

  return (
    <div className="space-y-6 pb-24">

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Product Search
        </h2>

        <p className="mt-1 text-slate-500">
          Find products online, add verified ingredients, and build your routine.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-slate-500" />
            Search Product Online
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <FieldLabel>Product Search Name</FieldLabel>
            <input
              type="text"
              value={onlineSearch}
              onChange={(e) => setOnlineSearch(e.target.value)}
              placeholder="Example: Cetaphil Moisturising Cream"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">

            <a
              href={canOpenSearch ? buildSearchUrl('nykaa', onlineSearch) : '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!canOpenSearch) {
                  e.preventDefault();
                  toast.error('Type a product name first.');
                }
              }}
            >
              <Button variant="outline" type="button">
                Search Nykaa
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>

            <a
              href={canOpenSearch ? buildSearchUrl('amazon', onlineSearch) : '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!canOpenSearch) {
                  e.preventDefault();
                  toast.error('Type a product name first.');
                }
              }}
            >
              <Button variant="outline" type="button">
                Search Amazon
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>

            <a
              href={canOpenSearch ? buildSearchUrl('google', onlineSearch) : '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!canOpenSearch) {
                  e.preventDefault();
                  toast.error('Type a product name first.');
                }
              }}
            >
              <Button variant="outline" type="button">
                Search Ingredients
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>

          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs leading-relaxed text-amber-800">
              For accuracy, copy the ingredient list from the official product page,
              packaging, or brand website. The app will then analyse and save it.
            </p>
          </div>

        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-slate-500" />
            Add Verified Product
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <FieldLabel>Product Name</FieldLabel>
            <input
              type="text"
              placeholder="Example: Cetaphil Moisturising Cream"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <FieldLabel>Brand</FieldLabel>
            <input
              type="text"
              placeholder="Example: Cetaphil"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <FieldLabel>Category</FieldLabel>
            <input
              type="text"
              placeholder="Example: Moisturizer, Sunscreen, Serum"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <FieldLabel>Price in INR</FieldLabel>
            <input
              type="number"
              placeholder="Example: 450"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div>
            <FieldLabel>Ingredient List</FieldLabel>
            <textarea
              rows={5}
              placeholder="Example: Aqua, Glycerin, Dimethicone, Niacinamide"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-slate-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Separate ingredients with commas.
            </p>
          </div>

          <Button
            onClick={handleSaveProduct}
            disabled={createMutation.isPending}
            className="bg-slate-900 text-white hover:bg-slate-700"
          >
            {createMutation.isPending
              ? 'Saving...'
              : 'Save Product'}
          </Button>

        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Saved Products
        </h3>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
            <ShoppingBag className="h-8 w-8 text-slate-300" />

            <p className="mt-2 text-sm text-slate-400">
              No products saved yet.
            </p>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="space-y-4">
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDeleted={refetch}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}