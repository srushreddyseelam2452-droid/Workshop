'use client';

import React, { useState } from 'react';
import { TripItinerary, Activity, ActivityCategory } from '@/types/trip';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Lightbulb,
  Utensils,
  Camera,
  Car,
  Compass,
  Smile,
  Moon,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

interface ItineraryTimelineProps {
  trip: TripItinerary;
  onActivityToggle?: (dayNumber: number, activityId: string, completed: boolean) => void;
}

export default function ItineraryTimeline({ trip, onActivityToggle }: ItineraryTimelineProps) {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    trip.days.forEach((d) => {
      d.activities.forEach((a) => {
        if (a.isCompleted) initial[a.id] = true;
      });
    });
    return initial;
  });

  const activeDay = trip.days.find((d) => d.dayNumber === selectedDayNumber) || trip.days[0];
  const currency = trip.budget.breakdown.currency || 'USD';

  const categoryIcons: Record<ActivityCategory, any> = {
    sightseeing: Camera,
    food: Utensils,
    outdoor: Compass,
    culture: Camera,
    relaxation: Smile,
    nightlife: Moon,
    transit: Car,
    shopping: ShoppingBag,
  };

  const categoryColors: Record<ActivityCategory, { badge: string; text: string }> = {
    sightseeing: { badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', text: 'text-blue-600' },
    food: { badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', text: 'text-amber-600' },
    outdoor: { badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600' },
    culture: { badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', text: 'text-purple-600' },
    relaxation: { badge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800', text: 'text-teal-600' },
    nightlife: { badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', text: 'text-indigo-600' },
    transit: { badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', text: 'text-slate-600' },
    shopping: { badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', text: 'text-rose-600' },
  };

  const handleToggle = (actId: string) => {
    const newState = !completedActivities[actId];
    setCompletedActivities((prev) => ({ ...prev, [actId]: newState }));
    if (onActivityToggle && activeDay) {
      onActivityToggle(activeDay.dayNumber, actId, newState);
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {trip.days.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          const completedInDay = day.activities.filter((a) => completedActivities[a.id]).length;

          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/25'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700'
              }`}
            >
              <span>{day.title.split(':')[0]}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {completedInDay}/{day.activities.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Day Header Banner */}
      {activeDay && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-teal-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 border border-sky-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                {activeDay.date}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {activeDay.title}
              </h3>
              {activeDay.theme && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                  Theme: {activeDay.theme}
                </p>
              )}
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Day Estimated Cost</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {currency} {activeDay.dayEstimatedCost?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Activities Timeline */}
      {activeDay && (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {activeDay.activities.map((activity, index) => {
            const isCompleted = completedActivities[activity.id] || false;
            const CategoryIcon = categoryIcons[activity.category] || Compass;
            const colorMeta = categoryColors[activity.category] || categoryColors.sightseeing;

            return (
              <div
                key={activity.id}
                className={`relative group rounded-2xl p-4 sm:p-5 border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Timeline connector dot */}
                <button
                  onClick={() => handleToggle(activity.id)}
                  className={`absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-600 group-hover:border-sky-500'
                  }`}
                  title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                </button>

                {/* Card Top: Time, Category & Cost */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-sky-500" />
                      {activity.time}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${colorMeta.badge}`}>
                      <CategoryIcon className="w-3 h-3" />
                      {activity.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Duration: <strong className="text-slate-700 dark:text-slate-200">{activity.duration}</strong>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                      {currency} {activity.estimatedCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Center: Title & Description */}
                <div className="pt-3 space-y-2">
                  <h4 className={`text-base font-bold text-slate-900 dark:text-white ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                    {activity.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activity.description}
                  </p>

                  {/* Location badge */}
                  <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 pt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{activity.location}</span>
                  </div>
                </div>

                {/* Insider Pro Tip Box */}
                {activity.tips && (
                  <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug">
                      <strong className="font-semibold">Local Pro-Tip:</strong> {activity.tips}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
