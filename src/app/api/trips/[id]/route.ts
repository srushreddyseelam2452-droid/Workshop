import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { SAMPLE_TRIPS } from '@/lib/mock-data';
import { TripItinerary } from '@/types/trip';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return NextResponse.json({
          trip: {
            ...(data.itinerary_data as TripItinerary),
            id: data.id,
            status: data.status,
            userId: data.user_id,
          },
        });
      }
    }

    const found = SAMPLE_TRIPS.find((t) => t.id === id);
    if (found) {
      return NextResponse.json({ trip: found });
    }

    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const trip = body as TripItinerary;

    const supabase = getServerSupabase();
    if (supabase) {
      await supabase
        .from('trips')
        .update({
          status: trip.status,
          title: trip.title,
          itinerary_data: trip,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    return NextResponse.json({ success: true, trip });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServerSupabase();
    if (supabase) {
      await supabase.from('trips').delete().eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
