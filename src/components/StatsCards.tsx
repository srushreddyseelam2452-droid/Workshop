import React from 'react';
import { TripStats } from '@/types/trip';
import { MapPin, CalendarClock, CheckCircle2, Wallet, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: TripStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const currencySymbol = stats.currency === 'INR' ? '₹' : stats.currency === 'EUR' ? '€' : stats.currency === 'GBP' ? '£' : '$';

  const cards = [
    {
      title: 'Total Trips',
      value: stats.totalTrips,
      subtitle: `${stats.plannedTrips} planned in pipeline`,
      icon: MapPin,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Upcoming Trips',
      value: stats.upcomingTrips,
      subtitle: 'Next weekend adventures',
      icon: CalendarClock,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips,
      subtitle: 'Memories created',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-900',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Estimated Spend',
      value: `${currencySymbol}${stats.totalEstimatedSpend.toLocaleString()}`,
      subtitle: 'Tracked across all itineraries',
      icon: Wallet,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50 dark:bg-violet-950/40',
      border: 'border-violet-200 dark:border-violet-900',
      textColor: 'text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-700/60"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <p className="mt-1.5 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${card.gradient} text-white shadow-md`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span>{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
