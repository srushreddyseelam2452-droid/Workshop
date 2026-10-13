'use client';

import React, { useState } from 'react';
import { TripItinerary } from '@/types/trip';
import { CloudSun, CheckSquare, Square, Info, ShieldCheck, Thermometer } from 'lucide-react';

interface PackingListViewProps {
  trip: TripItinerary;
}

export default function PackingListView({ trip }: PackingListViewProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const weather = trip.weatherForecast || {
    summary: 'Mild and pleasant conditions',
    tempRange: '18°C - 24°C',
    recommendation: 'Dress in breathable casual layers.',
  };

  return (
    <div className="space-y-6">
      {/* Weather Forecast Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
              <CloudSun className="w-8 h-8 text-amber-200" />
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
                Destination Weather Forecast
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {trip.destination}
              </h3>
              <p className="text-xs text-sky-100 mt-1 max-w-xl">
                {weather.summary}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-sky-200 sm:justify-end">
              <Thermometer className="w-3.5 h-3.5" />
              <span>Temp Range</span>
            </div>
            <span className="text-lg font-extrabold text-white block mt-0.5">
              {weather.tempRange}
            </span>
          </div>
        </div>

        {weather.recommendation && (
          <div className="mt-4 pt-3 border-t border-white/15 text-xs text-sky-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{weather.recommendation}</span>
          </div>
        )}
      </div>

      {/* Packing Checklist Categories */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>Packing Checklist</span>
          <span className="text-xs font-normal text-slate-500">
            (Tap to check off items as you pack)
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trip.packingList?.map((cat, cIdx) => (
            <div
              key={cIdx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                {cat.category}
              </h4>
              <ul className="space-y-2">
                {cat.items.map((item, iIdx) => {
                  const itemKey = `${cIdx}-${iIdx}`;
                  const isChecked = checkedItems[itemKey] || false;
                  return (
                    <li
                      key={iIdx}
                      onClick={() => toggleItem(itemKey)}
                      className={`flex items-center gap-2.5 text-xs sm:text-sm p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? 'text-slate-400 line-through bg-slate-50 dark:bg-slate-700/40'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Tips & Safety */}
      {trip.travelTips && trip.travelTips.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Local Concierge Travel Tips
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {trip.travelTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
