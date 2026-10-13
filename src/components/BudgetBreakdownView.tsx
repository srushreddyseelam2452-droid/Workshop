'use client';

import React, { useState } from 'react';
import { TripItinerary } from '@/types/trip';
import { 
  DollarSign, 
  Car, 
  Hotel, 
  Utensils, 
  Ticket, 
  ShieldAlert, 
  TrendingDown, 
  Sparkles, 
  CheckCircle2, 
  PieChart 
} from 'lucide-react';

interface BudgetBreakdownViewProps {
  trip: TripItinerary;
  onOptimizeClick?: () => void;
}

export default function BudgetBreakdownView({ trip, onOptimizeClick }: BudgetBreakdownViewProps) {
  const [optimizing, setOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [potentialSavings, setPotentialSavings] = useState<number | null>(null);

  const b = trip.budget.breakdown;
  const allocated = trip.budget.allocated || 1;
  const currency = b.currency || 'USD';
  const total = b.totalEstimated;
  const isUnder = b.isUnderBudget;
  const diff = Math.abs(allocated - total);
  const percentUsed = Math.min(200, Math.round((total / allocated) * 100));

  const categories = [
    {
      title: 'Transportation',
      amount: b.transportation,
      icon: Car,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      textColor: 'text-blue-600 dark:text-blue-400',
      percentage: Math.round((b.transportation / (total || 1)) * 100),
      note: 'Flights, car rentals, tolls, fuel, or train tickets',
    },
    {
      title: 'Accommodation',
      amount: b.accommodation,
      icon: Hotel,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      percentage: Math.round((b.accommodation / (total || 1)) * 100),
      note: 'Hotels, Airbnb, boutique cabins, or resorts',
    },
    {
      title: 'Food & Dining',
      amount: b.foodAndDining,
      icon: Utensils,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      textColor: 'text-amber-600 dark:text-amber-400',
      percentage: Math.round((b.foodAndDining / (total || 1)) * 100),
      note: 'Cafes, lunches, tasting menus, and casual dinners',
    },
    {
      title: 'Activities & Attractions',
      amount: b.activitiesAndAttractions,
      icon: Ticket,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      percentage: Math.round((b.activitiesAndAttractions / (total || 1)) * 100),
      note: 'Museum tickets, tours, tastings, outdoor equipment',
    },
    {
      title: 'Miscellaneous & Buffer',
      amount: b.miscellaneous,
      icon: ShieldAlert,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      textColor: 'text-purple-600 dark:text-purple-400',
      percentage: Math.round((b.miscellaneous / (total || 1)) * 100),
      note: 'Contingency fund, shopping, tips, emergencies',
    },
  ];

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    try {
      const res = await fetch('/api/optimize-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: trip }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
        setPotentialSavings(data.potentialSavings);
      }
    } catch (e) {
      console.error('Failed to run budget optimizer', e);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Meter Card */}
      <div className="rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Budget Status Summary
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {currency} {total.toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                of {currency} {allocated.toLocaleString()} target
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cost per person: <strong>{currency} {b.costPerPerson?.toLocaleString() || 0}</strong> ({trip.preferences?.travelers || 1} travelers)
            </p>
          </div>

          {/* Health Pill */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border ${
                isUnder
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {isUnder ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              <span>
                {isUnder
                  ? `${currency} ${diff.toLocaleString()} Under Budget`
                  : `${currency} ${diff.toLocaleString()} Over Target`}
              </span>
            </div>

            <button
              onClick={handleRunOptimizer}
              disabled={optimizing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-sm disabled:opacity-50 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
              <span>{optimizing ? 'Analyzing...' : 'AI Optimizer'}</span>
            </button>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Budget Utilization: {percentUsed}%</span>
            <span>{isUnder ? 'Healthy' : 'Exceeded Target'}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700 flex overflow-hidden">
            {categories.map((c, i) => (
              <div
                key={i}
                className={`${c.color} h-full transition-all duration-500`}
                style={{ width: `${(c.amount / (total || 1)) * 100}%` }}
                title={`${c.title}: ${currency} ${c.amount}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Optimizer Advice Card if triggered */}
      {suggestions && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-50/80 via-sky-50/60 to-emerald-50/80 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-850 border border-sky-200 dark:border-slate-700 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                AI Budget Optimization Recommendations
              </h4>
            </div>
            {potentialSavings !== null && potentialSavings > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Potential Savings: ~{currency} {potentialSavings.toLocaleString()}
              </span>
            )}
          </div>
          <ul className="mt-3 space-y-2">
            {suggestions.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bgColor} ${cat.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {cat.percentage}% of total
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{cat.title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {currency} {cat.amount.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 line-clamp-2">
                  {cat.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
