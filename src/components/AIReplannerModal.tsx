'use client';

import React, { useState } from 'react';
import { TripItinerary } from '@/types/trip';
import { Sparkles, X, Wand2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AIReplannerModalProps {
  trip: TripItinerary;
  isOpen: boolean;
  onClose: () => void;
  onTripUpdated: (updatedTrip: TripItinerary) => void;
}

const PRESET_PROMPTS = [
  'Make this trip 20% cheaper by finding budget-friendly food and free scenic spots',
  'Replace high-intensity outdoor activities with relaxed art galleries & historic walks',
  'Focus more heavily on culinary gems, local street food, and wine tastings',
  'Make the entire itinerary indoor and rainy-day friendly',
  'Add romantic sunset dinner spots and scenic couple viewpoints',
  'Adjust the pace to be very relaxed with late morning starts',
];

export default function AIReplannerModal({
  trip,
  isOpen,
  onClose,
  onTripUpdated,
}: AIReplannerModalProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyReplan = async () => {
    if (!instruction.trim()) {
      setErrorMessage('Please enter an instruction or select a suggested prompt.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Consulting Gemini AI to adjust schedule, budget, and activities...');

    try {
      const storedKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '';

      const res = await fetch('/api/replan-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': storedKey,
        },
        body: JSON.stringify({
          itinerary: trip,
          instructions: instruction,
          apiKey: storedKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to replan itinerary');
      }

      setStatusMessage('Itinerary successfully updated!');
      setTimeout(() => {
        onTripUpdated(data.itinerary);
        onClose();
        setLoading(false);
        setStatusMessage(null);
      }, 700);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while replanning. Please try again.');
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-850 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                AI Itinerary Replanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modify your weekend plan with natural language instructions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Prompt Chips */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
            Quick Adjustment Suggestions
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {PRESET_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInstruction(prompt)}
                disabled={loading}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200/60 dark:border-slate-700 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
            Or describe your changes in your own words:
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={loading}
            placeholder="e.g., 'Make day 2 more kid-friendly and replace seafood dinner with authentic pizza'..."
            rows={3}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Status or Error Notifications */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyReplan}
            disabled={loading || !instruction.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 shadow-md shadow-sky-500/20 transition-all"
          >
            <Wand2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Re-planning Itinerary...' : 'Apply AI Replan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
