'use client';

import React from 'react';
import Link from 'next/link';
import TripForm from '@/components/TripForm';
import { Compass, ArrowLeft, Sparkles } from 'lucide-react';

export default function CreateTripPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <Sparkles className="w-3 h-3 text-sky-500" />
          Powered by Google Gemini AI
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Plan Your Next Weekend Getaway
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure your travel details below. Our AI engine optimizes your schedule for real travel times, local meal spots, and budget limits.
        </p>
      </div>

      <TripForm />
    </div>
  );
}
