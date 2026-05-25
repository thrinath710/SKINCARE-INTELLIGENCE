// frontend/app/dashboard/scan/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { scanImage, analyzeIngredients } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ScanLine,
  Upload,
  ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  avoid: {
    label: 'Avoid Together',
    color: 'bg-red-50 border-red-200',
    badgeClass: 'bg-red-100 text-red-700',
    icon: XCircle,
    iconClass: 'text-red-500',
  },
  time_separate: {
    label: 'Use at Different Times',
    color: 'bg-amber-50 border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700',
    icon: Clock,
    iconClass: 'text-amber-500',
  },
  caution: {
    label: 'Use with Caution',
    color: 'bg-yellow-50 border-yellow-200',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    icon: AlertTriangle,
    iconClass: 'text-yellow-500',
  },
};

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    mutate: scan,
    data: ocrResult,
    isPending: scanning,
    reset: resetScan,
  } = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return scanImage(formData);
    },
    onError: () => toast.error('OCR failed. Make sure the backend is running.'),
  });

  const {
    mutate: analyze,
    data: analysis,
    isPending: analyzing,
  } = useMutation({
    mutationFn: (ingredients: string[]) => analyzeIngredients(ingredients),
    onError: () => toast.error('Analysis failed.'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    resetScan();
  };

  const handleScan = () => {
    if (!selectedFile) return;
    scan(selectedFile);
  };

  const handleAnalyze = () => {
    if (!ocrResult?.ingredients || ocrResult.ingredients.length === 0) {
      toast.error('No ingredients found to analyse.');
      return;
    }
    analyze(ocrResult.ingredients);
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    resetScan();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Scan a Label</h2>
        <p className="mt-1 text-slate-500">
          Upload a photo of a product label to extract and analyse ingredients
        </p>
      </div>

      {/* Upload area */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ScanLine className="h-4 w-4 text-slate-500" />
            Upload Label Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {!preview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 transition-colors hover:border-slate-400 hover:bg-slate-100"
            >
              <Upload className="h-8 w-8 text-slate-400" />
              <div className="text-center">
                <p className="font-medium text-slate-600">Tap to upload an image</p>
                <p className="text-sm text-slate-400">JPG, PNG, WEBP supported</p>
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={preview}
                  alt="Label preview"
                  className="max-h-64 w-full rounded-xl border border-slate-200 object-contain"
                />
                <button
                  onClick={handleClear}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-sm hover:bg-slate-100"
                >
                  <XCircle className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleScan}
                  disabled={scanning}
                  className="bg-slate-900 text-white hover:bg-slate-700"
                >
                  {scanning ? 'Scanning…' : 'Extract Ingredients'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanning skeleton */}
      {scanning && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {/* OCR Results */}
      {ocrResult && !scanning && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4 text-slate-500" />
                Extracted Ingredients
              </CardTitle>
              <div className="flex items-center gap-2">
                {ocrResult.method && (
                  <Badge variant="outline" className="text-xs capitalize">
                    via {ocrResult.method}
                  </Badge>
                )}
                {ocrResult.confidence && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(ocrResult.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ocrResult.ingredients && ocrResult.ingredients.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {ocrResult.ingredients.map((ing, i) => (
                    <Badge key={i} variant="secondary" className="capitalize text-xs">
                      {ing.toLowerCase()}
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-slate-900 text-white hover:bg-slate-700"
                >
                  {analyzing ? 'Analysing…' : 'Check for Conflicts'}
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No ingredients could be extracted. Try a clearer image.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conflict analysis */}
      {analysis && !analyzing && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Conflict Report
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-slate-200">
              <CardContent className="pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ingredients</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{analysis.total_ingredients ?? '—'}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Conflicts</p>
                <p className={`mt-1 text-2xl font-bold ${analysis.conflicts?.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {analysis.conflicts?.length ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {analysis.conflicts && analysis.conflicts.length > 0 ? (
            <div className="space-y-3">
              {analysis.conflicts.map((conflict, i) => {
                const config = SEVERITY_CONFIG[conflict.severity] ?? SEVERITY_CONFIG.caution;
                const Icon = config.icon;
                return (
                  <div key={i} className={`rounded-xl border p-4 ${config.color}`}>
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 capitalize">
                            {conflict.ingredient_a.toLowerCase()}
                          </span>
                          <span className="text-slate-400">+</span>
                          <span className="font-semibold text-slate-900 capitalize">
                            {conflict.ingredient_b.toLowerCase()}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-600">{conflict.explanation}</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">💡 {conflict.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="font-medium text-green-700">No conflicts detected.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}