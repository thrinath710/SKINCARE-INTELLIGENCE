// frontend/app/dashboard/routine/page.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analyzeIngredients } from '@/lib/api-client';
import { useAppStore, RoutineProduct } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShoppingBag,
} from 'lucide-react';

// --- Sortable product item ---

function SortableProduct({
  product,
  onRemove,
}: {
  product: RoutineProduct;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-slate-300 hover:text-slate-500"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <ShoppingBag className="h-5 w-5 text-slate-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-slate-900 text-sm">{product.name}</p>
        {product.brand && (
          <p className="text-xs text-slate-400">{product.brand}</p>
        )}
        {product.price_inr && (
          <p className="text-xs text-slate-500">₹{product.price_inr}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(product.id)}
        className="shrink-0 text-slate-300 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// --- Routine column ---

function RoutineColumn({
  time,
  products,
  onRemove,
  onReorder,
}: {
  time: 'morning' | 'evening';
  products: RoutineProduct[];
  onRemove: (id: string) => void;
  onReorder: (time: 'morning' | 'evening', oldIndex: number, newIndex: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sorted = [...products].sort((a, b) => a.step_order - b.step_order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((p) => p.id === active.id);
    const newIndex = sorted.findIndex((p) => p.id === over.id);
    onReorder(time, oldIndex, newIndex);
  };

  const Icon = time === 'morning' ? Sun : Moon;
  const label = time === 'morning' ? 'Morning Routine' : 'Evening Routine';
  const iconClass = time === 'morning' ? 'text-amber-500' : 'text-indigo-500';

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4 w-4 ${iconClass}`} />
          {label}
          <Badge variant="secondary" className="ml-auto">{products.length} steps</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
            <ShoppingBag className="h-6 w-6 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">
              No products yet. Add from Product Search.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sorted.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sorted.map((product) => (
                  <SortableProduct
                    key={product.id}
                    product={product}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main page ---

export default function RoutinePage() {
  const routine = useAppStore((s) => s.routine);
  const removeFromRoutine = useAppStore((s) => s.removeFromRoutine);
  const reorderRoutine = useAppStore((s) => s.reorderRoutine);

  const morningProducts = routine.filter((p) => p.time_of_day === 'morning');
  const eveningProducts = routine.filter((p) => p.time_of_day === 'evening');
  const allIngredients = routine.flatMap((p) => p.ingredients ?? []);

  const {
    mutate: checkConflicts,
    data: analysis,
    isPending: checking,
    reset,
  } = useMutation({
    mutationFn: (ingredients: string[]) => analyzeIngredients(ingredients),
    onError: () => toast.error('Conflict check failed.'),
  });

  const handleCheckConflicts = () => {
    if (allIngredients.length === 0) {
      toast.error('Add products with ingredients to your routine first.');
      return;
    }
    checkConflicts(allIngredients);
  };

  const handleRemove = (id: string) => {
    removeFromRoutine(id);
    reset();
    toast.success('Product removed from routine.');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Routine Builder</h2>
        <p className="mt-1 text-slate-500">
          Drag to reorder steps. Add products from the Search screen.
        </p>
      </div>

      {/* Conflict check button */}
      {routine.length > 0 && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCheckConflicts}
            disabled={checking}
            className="bg-slate-900 text-white hover:bg-slate-700"
          >
            {checking ? 'Checking…' : 'Check Routine for Conflicts'}
          </Button>
          <p className="text-xs text-slate-400">
            Checks all ingredients across your full routine
          </p>
        </div>
      )}

      {/* Conflict results */}
      {analysis && !checking && (
        <div className={`rounded-xl border p-4 ${
          analysis.conflicts?.length > 0
            ? 'border-red-200 bg-red-50'
            : 'border-green-200 bg-green-50'
        }`}>
          {analysis.conflicts?.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="font-semibold text-red-700">
                  {analysis.conflicts.length} conflict(s) found in your routine
                </p>
              </div>
              <Separator className="border-red-200" />
              {analysis.conflicts.map((conflict, i) => {
                const severityColors: Record<string, string> = {
                  avoid: 'text-red-600',
                  time_separate: 'text-amber-600',
                  caution: 'text-yellow-600',
                };
                const Icon = conflict.severity === 'avoid' ? XCircle :
                             conflict.severity === 'time_separate' ? Clock : AlertTriangle;
                return (
                  <div key={i} className="flex items-start gap-2">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${severityColors[conflict.severity]}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        <span className="capitalize">{conflict.ingredient_a.toLowerCase()}</span>
                        {' + '}
                        <span className="capitalize">{conflict.ingredient_b.toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-slate-600">{conflict.recommendation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="font-semibold text-green-700">
                No conflicts detected across your routine.
              </p>
            </div>
          )}
        </div>
      )}

      {/* AM / PM columns */}
      <div className="grid gap-4 sm:grid-cols-2">
        <RoutineColumn
          time="morning"
          products={morningProducts}
          onRemove={handleRemove}
          onReorder={reorderRoutine}
        />
        <RoutineColumn
          time="evening"
          products={eveningProducts}
          onRemove={handleRemove}
          onReorder={reorderRoutine}
        />
      </div>

    </div>
  );
}