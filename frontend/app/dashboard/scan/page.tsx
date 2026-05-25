'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ScanLine,
  AlertTriangle,
} from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Scan Ingredients
        </h2>

        <p className="mt-1 text-slate-500">
          OCR scanning is temporarily unavailable in the free cloud deployment.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            OCR Temporarily Disabled
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-amber-800">

          <p>
            The deployed backend currently runs on Render free tier,
            which does not include the system-level Tesseract OCR binary
            required for ingredient extraction.
          </p>

          <p>
            You can still use the platform fully by:
          </p>

          <ul className="list-disc space-y-1 pl-5">
            <li>Adding products manually</li>
            <li>Using Ingredient Analyzer</li>
            <li>Using AI Skin Assistant</li>
            <li>Building routines</li>
          </ul>

          <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-white p-3">
            <ScanLine className="h-4 w-4 text-amber-600" />
            <p className="text-xs">
              OCR can be re-enabled later using Google Vision,
              Gemini Vision, or a paid Render instance.
            </p>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}