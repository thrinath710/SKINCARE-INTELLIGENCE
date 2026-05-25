'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { useAppStore } from '@/lib/store';
import { saveUserProfile } from '@/lib/db';

import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';

const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'];

const SKIN_CONCERNS = [
  'Acne',
  'Hyperpigmentation',
  'Dark Spots',
  'Dullness',
  'Fine Lines',
  'Dehydration',
  'Pores',
  'Redness',
  'Uneven Texture',
  'Dark Circles',
  'Sun Damage',
];

const CLIMATE_ZONES = [
  { value: 'humid', label: 'Humid', description: 'Mumbai, Chennai, Kolkata' },
  { value: 'dry', label: 'Dry', description: 'Delhi, Rajasthan, Punjab' },
  { value: 'coastal', label: 'Coastal', description: 'Goa, Kochi, Vizag' },
  { value: 'hill', label: 'Hill / Temperate', description: 'Bangalore, Pune, Hyderabad' },
];

const BUDGET_RANGES = [
  { value: 'budget', label: 'Budget', description: 'Under ₹500' },
  { value: 'mid', label: 'Mid-range', description: '₹500 – ₹2,000' },
  { value: 'premium', label: 'Premium', description: '₹2,000+' },
];

const STEPS = ['Skin Type', 'Skin Concerns', 'Climate Zone', 'Budget', 'Review'];

const STEP_META = [
  {
    title: 'What is your skin type?',
    description: 'This helps us filter ingredients suited to your skin.',
  },
  {
    title: 'What are your skin concerns?',
    description: 'Select all that apply — pick as many as you like.',
  },
  {
    title: 'Where in India are you based?',
    description: 'Climate significantly affects which ingredients work for you.',
  },
  {
    title: 'What is your budget range?',
    description: 'We will prioritise products within your budget.',
  },
  {
    title: 'Review your profile',
    description: 'Everything look right? You can change this later in settings.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const setProfile = useAppStore((s) => s.setProfile);

  const [step, setStep] = useState(0);

  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [climate, setClimate] = useState('');
  const [budget, setBudget] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const canProceed = () => {
    if (step === 0) return !!skinType;
    if (step === 1) return concerns.length > 0;
    if (step === 2) return !!climate;
    if (step === 3) return !!budget;
    return true;
  };

  const toggleConcern = (concern: string) => {
    const lower = concern.toLowerCase();

    setConcerns((prev) =>
      prev.includes(lower)
        ? prev.filter((c) => c !== lower)
        : [...prev, lower]
    );
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    try {
      setIsSaving(true);

      const profilePayload = {
        skin_type: skinType,
        skin_concerns: concerns,
        climate_zone: climate,
        allergies: [],
        budget_range: budget,
      };

      // Save locally (Zustand)
      setProfile({
        ...profilePayload,
        onboarded: true,
      });

      // Save to Supabase
      const saveResult = await saveUserProfile(profilePayload);

      if (saveResult.saved) {
        toast.success('Profile saved successfully!');
      } else {
        toast.success('Profile saved locally. Cloud sync skipped.');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error(error);

      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            SkincareIQ
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Ingredient-level intelligence for Indian skin
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap justify-between gap-2">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`text-xs ${
                  i <= step
                    ? 'font-semibold text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {s}
              </span>
            ))}
          </div>

          <Progress value={progress} className="h-1.5" />

          <p className="mt-2 text-right text-xs text-slate-400">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">
              {STEP_META[step].title}
            </CardTitle>

            <CardDescription>
              {STEP_META[step].description}
            </CardDescription>
          </CardHeader>

          <CardContent>

            {/* Step 0 */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SKIN_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSkinType(type.toLowerCase())}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      skinType === type.toLowerCase()
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <p className="font-medium">{type}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERNS.map((concern) => {
                  const selected = concerns.includes(concern.toLowerCase());

                  return (
                    <button
                      key={concern}
                      onClick={() => toggleConcern(concern)}
                      className={`flex items-center gap-1 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                        selected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      {selected && <CheckCircle2 className="h-3 w-3" />}
                      {concern}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="grid gap-3">
                {CLIMATE_ZONES.map((zone) => (
                  <button
                    key={zone.value}
                    onClick={() => setClimate(zone.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      climate === zone.value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <p className="font-medium">{zone.label}</p>

                    <p
                      className={`text-sm ${
                        climate === zone.value
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {zone.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="grid gap-3">
                {BUDGET_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setBudget(range.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      budget === range.value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <p className="font-medium">{range.label}</p>

                    <p
                      className={`text-sm ${
                        budget === range.value
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {range.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-3">

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Skin Type
                  </p>

                  <p className="mt-1 text-lg font-semibold capitalize">
                    {skinType || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Concerns
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {concerns.length > 0 ? (
                      concerns.map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="capitalize"
                        >
                          {c}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">
                        None selected
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Climate
                  </p>

                  <p className="mt-1 text-lg font-semibold capitalize">
                    {climate || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Budget
                  </p>

                  <p className="mt-1 text-lg font-semibold capitalize">
                    {budget || '—'}
                  </p>
                </div>

              </div>
            )}

          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex justify-between gap-3">

          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0 || isSaving}
          >
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSaving}
            className="bg-slate-900 text-white hover:bg-slate-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {step === STEPS.length - 1
                  ? 'Save Profile'
                  : 'Continue'}
              </>
            )}
          </Button>

        </div>

      </div>
    </div>
  );
}