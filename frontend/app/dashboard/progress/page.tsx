'use client';

import { useEffect, useState } from 'react';

import {
  useAppStore,
  SkinCondition,
  ProgressLog,
} from '@/lib/store';

import {
  saveProgressLog,
  getProgressLogs,
} from '@/lib/db';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';

import { toast } from 'sonner';

import {
  TrendingUp,
  Plus,
  Calendar,
  Smile,
  Meh,
  Frown,
  Loader2,
} from 'lucide-react';

const CONDITION_CONFIG: Record<
  SkinCondition,
  {
    label: string;
    icon: typeof Smile;
    color: string;
    badgeClass: string;
  }
> = {
  good: {
    label: 'Good',
    icon: Smile,
    color: 'border-green-200 bg-green-50',
    badgeClass: 'bg-green-100 text-green-700',
  },

  okay: {
    label: 'Okay',
    icon: Meh,
    color: 'border-amber-200 bg-amber-50',
    badgeClass: 'bg-amber-100 text-amber-700',
  },

  bad: {
    label: 'Bad',
    icon: Frown,
    color: 'border-red-200 bg-red-50',
    badgeClass: 'bg-red-100 text-red-700',
  },
};

function ConditionPicker({
  value,
  onChange,
}: {
  value: SkinCondition | null;
  onChange: (v: SkinCondition) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.entries(CONDITION_CONFIG) as [
        SkinCondition,
        typeof CONDITION_CONFIG[SkinCondition]
      ][]).map(([key, config]) => {
        const Icon = config.icon;

        const selected = value === key;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              selected
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}
          >
            <Icon className="h-6 w-6" />

            <span className="text-sm font-medium">
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LogCard({ log }: { log: ProgressLog }) {
  const config = CONDITION_CONFIG[log.condition];

  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 text-slate-600" />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">
              {new Date(log.date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.badgeClass}`}
            >
              {config.label}
            </span>
          </div>

          {log.notes && (
            <p className="mt-1 text-sm text-slate-600">
              {log.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniChart({ logs }: { logs: ProgressLog[] }) {
  if (logs.length < 2) return null;

  const conditionScore: Record<SkinCondition, number> = {
    good: 3,
    okay: 2,
    bad: 1,
  };

  const last7 = logs.slice(0, 7).reverse();

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-slate-500" />
          Last {last7.length} Days
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-end gap-2" style={{ height: '80px' }}>
          {last7.map((log) => {
            const score = conditionScore[log.condition];

            const heightPercent = (score / 3) * 100;

            const barColor =
              log.condition === 'good'
                ? 'bg-green-400'
                : log.condition === 'okay'
                ? 'bg-amber-400'
                : 'bg-red-400';

            return (
              <div
                key={log.id}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="flex w-full flex-col justify-end"
                  style={{ height: '64px' }}
                >
                  <div
                    className={`w-full rounded-t-sm ${barColor}`}
                    style={{
                      height: `${heightPercent}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-slate-400">
                  {new Date(log.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProgressPage() {
  const logs = useAppStore((s) => s.logs);

  const addLog = useAppStore((s) => s.addLog);

  const setLogs = useAppStore((s) => s.setLogs);

  const [condition, setCondition] =
    useState<SkinCondition | null>(null);

  const [notes, setNotes] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [logDate, setLogDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const todayStr =
    new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadLogs() {
      try {
        const dbLogs = await getProgressLogs();

        if (dbLogs) {
          const formattedLogs: ProgressLog[] =
            dbLogs.map((log: any) => ({
              id: log.id,
              date: log.log_date,
              condition: log.skin_condition,
              notes: log.notes || '',
            }));

          setLogs(formattedLogs);
        }
      } catch (error) {
        console.error(error);

        toast.error('Failed to load progress logs');
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [setLogs]);

  const handleSave = async () => {
    if (!condition) {
      toast.error('Please select your skin condition.');
      return;
    }

    try {
      setSaving(true);

      const newLog: ProgressLog = {
        id: crypto.randomUUID(),
        date: logDate,
        condition,
        notes: notes.trim(),
      };

      addLog(newLog);

      await saveProgressLog({
        log_date: logDate,
        skin_condition: condition,
        notes: notes.trim(),
      });

      setCondition(null);

      setNotes('');

      setLogDate(todayStr);

      setShowForm(false);

      toast.success('Progress logged!');
    } catch (error) {
      console.error(error);

      toast.error('Failed to save progress log');
    } finally {
      setSaving(false);
    }
  };

  const goodCount =
    logs.filter((l) => l.condition === 'good').length;

  const okayCount =
    logs.filter((l) => l.condition === 'okay').length;

  const badCount =
    logs.filter((l) => l.condition === 'bad').length;

  return (
    <div className="space-y-6 pb-24">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Progress Tracker
          </h2>

          <p className="mt-1 text-slate-500">
            Log your skin condition daily
          </p>
        </div>

        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-slate-900 text-white hover:bg-slate-700"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Log Day
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-slate-500" />
              How does your skin feel?
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Date
              </label>

              <input
                type="date"
                value={logDate}
                max={todayStr}
                onChange={(e) =>
                  setLogDate(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </div>

            <ConditionPicker
              value={condition}
              onChange={setCondition}
            />

            <textarea
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              rows={3}
              placeholder="Optional notes — breakouts, dryness, new products tried…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!condition || saving}
                className="bg-slate-900 text-white hover:bg-slate-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Log'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>

          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading ? (
        <Card className="border-slate-200">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          {logs.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

              <Card className="border-slate-200">
                <CardContent className="pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Good Days
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {goodCount}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Okay Days
                  </p>

                  <p className="mt-1 text-2xl font-bold text-amber-600">
                    {okayCount}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Bad Days
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {badCount}
                  </p>
                </CardContent>
              </Card>

            </div>
          )}

          {/* Chart */}
          {logs.length >= 2 && (
            <MiniChart logs={logs} />
          )}

          <Separator />

          {/* History */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              History
            </h3>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
                <TrendingUp className="h-8 w-8 text-slate-300" />

                <p className="mt-2 text-sm text-slate-400">
                  No logs yet. Start tracking today.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}