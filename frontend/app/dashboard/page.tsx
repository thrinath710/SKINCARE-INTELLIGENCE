// frontend/app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import {
  Search,
  ScanLine,
  FlaskConical,
  CalendarDays,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import { useAppStore } from '@/lib/store';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  {
    href: '/dashboard/search',
    icon: Search,
    label: 'Search Products',
    description: 'Find and analyze products on Nykaa',
  },
  {
    href: '/dashboard/scan',
    icon: ScanLine,
    label: 'Scan a Label',
    description: 'Upload a product label to extract ingredients',
  },
  {
    href: '/dashboard/analyze',
    icon: FlaskConical,
    label: 'Analyze Ingredients',
    description: 'Check ingredient conflicts and irritation risks',
  },
  {
    href: '/dashboard/routine',
    icon: CalendarDays,
    label: 'Build Routine',
    description: 'Create and organise your skincare routine',
  },
  {
    href: '/dashboard/progress',
    icon: TrendingUp,
    label: 'Track Progress',
    description: 'Monitor your skin condition over time',
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';

  return 'Good evening';
}

export default function DashboardPage() {
  const profile = useAppStore((s) => s.profile);
  const routine = useAppStore((s) => s.routine);
  const logs = useAppStore((s) => s.logs);

  const morningCount = routine.filter(
    (p) => p.time_of_day === 'morning'
  ).length;

  const eveningCount = routine.filter(
    (p) => p.time_of_day === 'evening'
  ).length;

  const latestLog = logs[0];

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-slate-300" />
              <p className="text-sm font-medium text-slate-300">
                SkincareIQ
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {getGreeting()}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
              Your AI-powered skincare intelligence dashboard for routines,
              ingredient safety, progress tracking, and personalised analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Profile */}
      {profile ? (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Your Skin Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">
                {profile.skin_type} skin
              </Badge>

              <Badge variant="secondary" className="capitalize">
                {profile.climate_zone} climate
              </Badge>

              <Badge variant="secondary" className="capitalize">
                {profile.budget_range} budget
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.skin_concerns.map((concern) => (
                <Badge
                  key={concern}
                  variant="outline"
                  className="capitalize"
                >
                  {concern}
                </Badge>
              ))}
            </div>

          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Sparkles className="h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No skin profile found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Complete onboarding to receive personalised skincare analysis and recommendations.
            </p>

            <Link href="/onboarding" className="mt-4">
              <Button className="bg-slate-900 hover:bg-slate-700">
                Complete Onboarding
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <Card className="border-slate-200">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Morning Routine
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {morningCount}
            </p>

            <p className="text-sm text-slate-500">
              {morningCount === 1 ? 'product' : 'products'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Evening Routine
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {eveningCount}
            </p>

            <p className="text-sm text-slate-500">
              {eveningCount === 1 ? 'product' : 'products'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Latest Progress
            </p>

            <p className="mt-2 text-lg font-bold capitalize text-slate-900">
              {latestLog?.condition ?? 'No logs'}
            </p>

            <p className="text-sm text-slate-500">
              {latestLog
                ? new Date(latestLog.date).toLocaleDateString('en-IN')
                : 'Start tracking today'}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Empty routine state */}
      {routine.length === 0 && (
        <Card className="border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarDays className="h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              Your routine is empty
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Start building your AM and PM skincare routine with products tailored to your skin profile.
            </p>

            <Link href="/dashboard/routine" className="mt-4">
              <Button className="bg-slate-900 hover:bg-slate-700">
                Build Routine
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div>

        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Quick Actions
        </h3>

        <div className="space-y-3">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, description }) => (
            <Link key={href} href={href}>
              <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-slate-900">
                  <Icon className="h-5 w-5 text-slate-700 group-hover:text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {label}
                  </p>

                  <p className="text-sm text-slate-500">
                    {description}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* Edit profile */}
      <div className="text-center">
        <Link href="/onboarding">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-700"
          >
            Edit Skin Profile
          </Button>
        </Link>
      </div>

    </div>
  );
}