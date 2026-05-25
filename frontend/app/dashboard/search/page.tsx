'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  listProducts,
  analyzeIngredients,
} from '@/lib/api-client';

import { useAppStore } from '@/lib/store';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Search,
  ShoppingBag,
  Plus,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';

import { toast } from 'sonner';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

export default function SearchPage() {
  const addToRoutine = useAppStore((s) => s.addToRoutine);

  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState('');

  const {
    data: products,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const parsedIngredients = ingredients
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const response = await fetch(
        `${API_BASE}/api/v1/products/manual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productName,
            brand,
            ingredients: parsedIngredients,
            price_inr: price ? Number(price) : null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      return response.json();
    },

    onSuccess: () => {
      toast.success('Product added successfully.');

      setProductName('');
      setBrand('');
      setIngredients('');
      setPrice('');

      refetch();
    },

    onError: () => {
      toast.error('Failed to add product.');
    },
  });

  const handleAdd = () => {
    if (!productName.trim()) {
      toast.error('Enter product name.');
      return;
    }

    if (!ingredients.trim()) {
      toast.error('Enter ingredients.');
      return;
    }

    createMutation.mutate();
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Product Search
        </h2>

        <p className="mt-1 text-slate-500">
          Add skincare products manually for analysis and routines
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-slate-500" />
            Add Product
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          <input
            type="text"
            placeholder="Product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Price in INR"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          />

          <textarea
            rows={4}
            placeholder="Ingredients separated by commas"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
          />

          <Button
            onClick={handleAdd}
            disabled={createMutation.isPending}
            className="bg-slate-900 text-white hover:bg-slate-700"
          >
            {createMutation.isPending
              ? 'Adding...'
              : 'Add Product'}
          </Button>

        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-slate-500" />
            Quick Shopping Links
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">

          <a
            href="https://www.nykaa.com"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline">
              Nykaa
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>

          <a
            href="https://www.amazon.in"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline">
              Amazon
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>

        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Saved Products
        </h3>

        <div className="space-y-4">

          {products?.map((product: any) => (
            <Card
              key={product.id}
              className="border-slate-200"
            >
              <CardContent className="pt-5">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <p className="font-semibold text-slate-900">
                      {product.name}
                    </p>

                    {product.brand && (
                      <p className="text-sm text-slate-500">
                        {product.brand}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">

                      {product.price_inr && (
                        <Badge variant="secondary">
                          ₹{product.price_inr}
                        </Badge>
                      )}

                      {product.ingredients?.length > 0 && (
                        <Badge variant="outline">
                          {product.ingredients.length} ingredients
                        </Badge>
                      )}

                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() =>
                      addToRoutine(product, 'morning')
                    }
                    className="bg-slate-900 text-white hover:bg-slate-700"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Routine
                  </Button>

                </div>

                {product.ingredients?.length > 0 && (
                  <p className="mt-4 text-xs leading-relaxed text-slate-500">
                    {product.ingredients.join(', ')}
                  </p>
                )}

              </CardContent>
            </Card>
          ))}

        </div>
      </div>

    </div>
  );
}