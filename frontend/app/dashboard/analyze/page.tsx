'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  analyzeIngredients,
  getRecommendation,
  AnalysisResult,
  ConflictResult,
} from '@/lib/api-client';
import { useAppStore } from '@/lib/store';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { toast } from 'sonner';

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FlaskConical,
  Sparkles,
  ShieldAlert,
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
    label: 'Use Separately',
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

function ConflictCard({ conflict }: { conflict: ConflictResult }) {
  const config =
    SEVERITY_CONFIG[conflict.severity] ?? SEVERITY_CONFIG.caution;

  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`} />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold capitalize">
              {conflict.ingredient_a.toLowerCase()}
            </span>

            <span className="text-slate-400">+</span>

            <span className="font-semibold capitalize">
              {conflict.ingredient_b.toLowerCase()}
            </span>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}
            >
              {config.label}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {conflict.explanation}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            💡 {conflict.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

function AIRecommendationCard({ recommendation }: any) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          AI Recommendation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Verdict
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {recommendation.verdict}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Summary
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {recommendation.summary}
          </p>
        </div>

        {recommendation.warnings?.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Warnings
            </p>

            <div className="space-y-2">
              {recommendation.warnings.map((warning: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                  <p className="text-sm text-red-700">
                    {warning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendation.india_specific_notes && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              India-specific Notes
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {recommendation.india_specific_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyzePage() {
  const profile = useAppStore((s) => s.profile);

  const [inputText, setInputText] = useState('');

  const [analysisData, setAnalysisData] =
    useState<AnalysisResult | null>(null);

  const [recommendation, setRecommendation] = useState<any>(null);

  const analysisMutation = useMutation({
    mutationFn: (ingredients: string[]) =>
      analyzeIngredients(ingredients),

    onSuccess: (data) => {
      setAnalysisData(data);
    },

    onError: () => {
      toast.error('Ingredient analysis failed.');
    },
  });

  const recommendationMutation = useMutation({
    mutationFn: (ingredients: string[]) =>
      getRecommendation({
        ingredients,
        skin_type: profile?.skin_type,
        skin_concerns: profile?.skin_concerns,
        climate_zone: profile?.climate_zone,
      }),

    onSuccess: (data: any) => {
      setRecommendation(data.ai_recommendation);

      toast.success('AI recommendation generated!');
    },

    onError: () => {
      toast.error('Failed to generate AI recommendation.');
    },
  });

  const parseIngredients = () => {
    return inputText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleAnalyze = () => {
    const ingredients = parseIngredients();

    if (ingredients.length < 2) {
      toast.error('Enter at least 2 ingredients.');
      return;
    }

    setRecommendation(null);

    analysisMutation.mutate(ingredients);
  };

  const handleRecommendation = () => {
    const ingredients = parseIngredients();

    recommendationMutation.mutate(ingredients);
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Ingredient Analyzer
        </h2>

        <p className="mt-1 text-slate-500">
          Detect conflicts, irritation risks, and AI skincare advice
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="h-4 w-4 text-slate-500" />
            Ingredient List
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Niacinamide, Retinol, Glycolic Acid..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-slate-400 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2">

            <Button
              onClick={handleAnalyze}
              disabled={analysisMutation.isPending}
              className="bg-slate-900 text-white hover:bg-slate-700"
            >
              {analysisMutation.isPending
                ? 'Analysing...'
                : 'Analyse Ingredients'}
            </Button>

            {analysisData && (
              <Button
                variant="outline"
                onClick={handleRecommendation}
                disabled={recommendationMutation.isPending}
              >
                {recommendationMutation.isPending
                  ? 'Generating...'
                  : 'Get AI Recommendation'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(analysisMutation.isPending ||
        recommendationMutation.isPending) && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {analysisData && (
        <div className="space-y-3">
          {analysisData.conflicts?.length > 0 ? (
            analysisData.conflicts.map((conflict, i) => (
              <ConflictCard key={i} conflict={conflict} />
            ))
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />

              <p className="font-medium text-green-700">
                No ingredient conflicts detected.
              </p>
            </div>
          )}
        </div>
      )}

      {recommendation && (
        <AIRecommendationCard recommendation={recommendation} />
      )}

    </div>
  );
}