'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TripItinerary, TripStatus } from '@/types/trip';
import { fetchAllTrips, saveTrip, deleteTrip } from '@/lib/storage';
import TripCard from '@/components/TripCard';
import { exportItineraryToPDF } from '@/lib/pdf-export';
import { 
  Bookmark, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  ArrowUpDown, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  MapPin 
} from 'lucide-react';

export default function SavedTripsPage() {
  const [trips, setTrips] = useState<TripItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TripStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'title'>('date');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    const { trips: loaded } = await fetchAllTrips();
    setTrips(loaded);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: TripStatus) => {
    const target = trips.find((t) => t.id === id);
    if (target) {
      const updated = { ...target, status: newStatus };
      await saveTrip(updated);
      setTrips((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesSearch =
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    if (sortBy === 'budget') {
      return (b.budget?.allocated || 0) - (a.budget?.allocated || 0);
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-sky-500" />
            <span>Saved Itineraries</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, edit, or download all generated travel itineraries stored in your database.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Itinerary</span>
        </Link>
      </div>

      {/* Control Bar: Search, Status Filter, Sort, View Toggle */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'planned', label: 'Planned' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-sky-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Sort & Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="budget">Budget</option>
            <option value="title">Title</option>
          </select>

          {/* Grid vs Table Toggle */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid or Table */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : sortedTrips.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No saved itineraries match your criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try resetting your filters or create a new weekend getaway itinerary.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Trip & Destination</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Travelers</th>
                <th className="p-4">Budget / Est.</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sortedTrips.map((trip) => {
                const currency = trip.budget.breakdown.currency;
                const est = trip.budget.breakdown.totalEstimated;
                return (
                  <tr key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {trip.title}
                      </div>
                      <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        <span>{trip.destination}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div>{trip.startDate} to {trip.endDate}</div>
                      <span className="text-[11px] text-slate-400">{trip.durationDays} Days</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {trip.preferences?.travelers || 1} ({trip.preferences?.travelerType || 'solo'})
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {currency} {est.toLocaleString()}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Alloc: {currency} {trip.budget.allocated.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <select
                        value={trip.status}
                        onChange={(e) => handleStatusChange(trip.id, e.target.value as TripStatus)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 capitalize cursor-pointer outline-none"
                      >
                        <option value="planned">Planned</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => exportItineraryToPDF(trip)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-700"
                          title="Export PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${trip.title}?`)) {
                              handleDelete(trip.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
