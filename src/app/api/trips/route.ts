import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { SAMPLE_TRIPS } from '@/lib/mock-data';
import { TripItinerary } from '@/types/trip';

export async function GET() {
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map((item) => ({
          ...(item.itinerary_data as TripItinerary),
          id: item.id,
          status: item.status,
          userId: item.user_id,
        }));
        return NextResponse.json({ trips: mapped, source: 'supabase' });
      }
    }

    return NextResponse.json({ trips: SAMPLE_TRIPS, source: 'mock' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message, trips: SAMPLE_TRIPS }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const trip = body as TripItinerary;

    if (!trip || !trip.id) {
      return NextResponse.json({ error: 'Valid trip object required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (supabase) {
      const payload = {
        id: trip.id,
        user_id: trip.userId || null,
        title: trip.title,
        destination: trip.destination,
        origin: trip.origin,
        start_date: trip.startDate,
        end_date: trip.endDate,
        duration_days: trip.durationDays,
        status: trip.status,
        hero_image: trip.heroImage || null,
        summary: trip.summary,
        budget_allocated: trip.budget.allocated,
        budget_estimated: trip.budget.breakdown.totalEstimated,
        currency: trip.budget.breakdown.currency,
        itinerary_data: trip,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('trips').upsert(payload);
      if (error) {
        console.warn('Server Supabase upsert error:', error);
      }
    }

    return NextResponse.json({ success: true, trip });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
