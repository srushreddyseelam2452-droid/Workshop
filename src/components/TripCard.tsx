'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TripItinerary, TripStatus } from '@/types/trip';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { exportItineraryToPDF } from '@/lib/pdf-export';

interface TripCardProps {
  trip: TripItinerary;
  onStatusChange?: (id: string, newStatus: TripStatus) => void;
  onDelete?: (id: string) => void;
}

export default function TripCard({ trip, onStatusChange, onDelete }: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const statusColors: Record<TripStatus, { bg: string; text: string; border: string; icon: any }> = {
    upcoming: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Clock,
    },
    planned: {
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800',
      icon: Sparkles,
    },
    completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    },
    cancelled: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: AlertCircle,
    },
  };

  const statusInfo = statusColors[trip.status] || statusColors.planned;
  const StatusIcon = statusInfo.icon;
  const currency = trip.budget?.breakdown?.currency || 'USD';
  const estimatedCost = trip.budget?.breakdown?.totalEstimated || 0;
  const allocatedBudget = trip.budget?.allocated || 0;
  const isUnderBudget = trip.budget?.breakdown?.isUnderBudget ?? (estimatedCost <= allocatedBudget);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${trip.title}"?`)) {
      setIsDeleting(true);
      if (onDelete) onDelete(trip.id);
    }
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    exportItineraryToPDF(trip);
  };

  const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = e.target.value as TripStatus;
    if (onStatusChange) {
      onStatusChange(trip.id, newStatus);
    }
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div>
        {/* Top Image Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={trip.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
            alt={trip.destination}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={trip.status}
                onChange={handleStatusSelect}
                onClick={(e) => e.stopPropagation()}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm cursor-pointer capitalize outline-none backdrop-blur-md transition-colors ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
              >
                <option value="planned">Planned</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Duration pill */}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/75 text-white backdrop-blur-md border border-white/10">
              {trip.durationDays} Days
            </span>
          </div>

          {/* Bottom Destination Title */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-sky-300">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>
            <h3 className="text-base font-bold text-white truncate drop-shadow-sm">
              {trip.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Dates & Travelers */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{trip.startDate} - {trip.endDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{trip.preferences?.travelers || 1} {trip.preferences?.travelerType || 'person'}</span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {trip.summary}
          </p>

          {/* Budget Info */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Cost</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currency} {estimatedCost.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Budget: {currency} {allocatedBudget.toLocaleString()}</span>
              <span className={`font-semibold ${isUnderBudget ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isUnderBudget ? 'Under budget' : 'Over budget'}
              </span>
            </div>
          </div>

          {/* Interest tags */}
          {trip.preferences?.interests && trip.preferences.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {trip.preferences.interests.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
              {trip.preferences.interests.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400">
                  +{trip.preferences.interests.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportPDF}
            title="Download PDF Itinerary"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Trip"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 transition-colors shadow-xs"
        >
          <span>View Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
