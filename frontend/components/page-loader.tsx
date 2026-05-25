'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function PageLoader() {
  return (
    <div className="space-y-4">

      <Skeleton className="h-28 w-full rounded-2xl" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />

    </div>
  );
}