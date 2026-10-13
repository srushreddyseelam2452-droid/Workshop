import { TripItinerary, TripStats, TripStatus } from '@/types/trip';
import { SAMPLE_TRIPS } from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase/client';

const LOCAL_STORAGE_KEY = 'weekend_getaway_trips_v1';

// Helper to safely get from localStorage
function getLocalTrips(): TripItinerary[] {
  if (typeof window === 'undefined') return SAMPLE_TRIPS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Initialize with sample trips
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_TRIPS));
      return SAMPLE_TRIPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_TRIPS;
  } catch (e) {
    console.error('Failed to parse local trips', e);
    return SAMPLE_TRIPS;
  }
}

// Helper to save to localStorage
function saveLocalTrips(trips: TripItinerary[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

/**
 * Fetch all trips for the active user (Supabase or LocalStorage)
 */
export async function fetchAllTrips(): Promise<{ trips: TripItinerary[]; source: 'supabase' | 'local' }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .order('start_date', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: TripItinerary[] = data.map((item) => ({
            ...(item.itinerary_data as TripItinerary),
            id: item.id,
            status: item.status as TripStatus,
            userId: item.user_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
          return { trips: mapped, source: 'supabase' };
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage', err);
    }
  }

  return { trips: getLocalTrips(), source: 'local' };
}

/**
 * Get single trip by ID
 */
export async function getTripById(id: string): Promise<TripItinerary | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          ...(data.itinerary_data as TripItinerary),
          id: data.id,
          status: data.status as TripStatus,
          userId: data.user_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      console.warn('Supabase getTripById failed, checking local', e);
    }
  }

  const local = getLocalTrips();
  const found = local.find((t) => t.id === id);
  return found || null;
}

/**
 * Save new or existing trip
 */
export async function saveTrip(trip: TripItinerary): Promise<{ success: boolean; trip: TripItinerary }> {
  // Always update local storage first for resilience and speed
  const local = getLocalTrips();
  const existingIndex = local.findIndex((t) => t.id === trip.id);
  const updatedTrip = {
    ...trip,
    updatedAt: new Date().toISOString(),
  };

  let newLocalList: TripItinerary[];
  if (existingIndex >= 0) {
    newLocalList = [...local];
    newLocalList[existingIndex] = updatedTrip;
  } else {
    newLocalList = [updatedTrip, ...local];
  }
  saveLocalTrips(newLocalList);

  // If Supabase is active, persist to PostgreSQL
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const payload = {
        id: updatedTrip.id,
        user_id: userId,
        title: updatedTrip.title,
        destination: updatedTrip.destination,
        origin: updatedTrip.origin,
        start_date: updatedTrip.startDate,
        end_date: updatedTrip.endDate,
        duration_days: updatedTrip.durationDays,
        status: updatedTrip.status,
        hero_image: updatedTrip.heroImage || null,
        summary: updatedTrip.summary,
        budget_allocated: updatedTrip.budget.allocated,
        budget_estimated: updatedTrip.budget.breakdown.totalEstimated,
        currency: updatedTrip.budget.breakdown.currency,
        itinerary_data: updatedTrip,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('trips')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase upsert failed, stored in local storage:', error.message);
      }
    } catch (err) {
      console.warn('Supabase error during saveTrip:', err);
    }
  }

  return { success: true, trip: updatedTrip };
}

/**
 * Delete a trip
 */
export async function deleteTrip(id: string): Promise<boolean> {
  const local = getLocalTrips();
  const filtered = local.filter((t) => t.id !== id);
  saveLocalTrips(filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('trips').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete failed', e);
    }
  }

  return true;
}

/**
 * Compute stats from trips
 */
export function calculateTripStats(trips: TripItinerary[]): TripStats {
  const stats: TripStats = {
    totalTrips: trips.length,
    upcomingTrips: 0,
    completedTrips: 0,
    plannedTrips: 0,
    cancelledTrips: 0,
    totalEstimatedSpend: 0,
    currency: 'USD',
  };

  for (const t of trips) {
    if (t.status === 'upcoming') stats.upcomingTrips++;
    else if (t.status === 'completed') stats.completedTrips++;
    else if (t.status === 'planned') stats.plannedTrips++;
    else if (t.status === 'cancelled') stats.cancelledTrips++;

    stats.totalEstimatedSpend += (t.budget?.breakdown?.totalEstimated || 0);
    if (t.budget?.breakdown?.currency) {
      stats.currency = t.budget.breakdown.currency;
    }
  }

  return stats;
}
