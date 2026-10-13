import { NextRequest, NextResponse } from 'next/server';
import { TripItinerary } from '@/types/trip';

export async function POST(req: NextRequest) {
  try {
    const { itinerary } = (await req.json()) as { itinerary: TripItinerary };

    if (!itinerary) {
      return NextResponse.json({ error: 'Itinerary is required' }, { status: 400 });
    }

    const { breakdown, allocated } = itinerary.budget;
    const suggestions: string[] = [];
    let potentialSavings = 0;

    // Check transportation
    if (breakdown.transportation > allocated * 0.25) {
      suggestions.push(
        `Transportation is ${Math.round((breakdown.transportation / allocated) * 100)}% of your budget. Consider purchasing a 24-48h unlimited public transit pass or cycling sharing instead of private rides.`
      );
      potentialSavings += Math.round(breakdown.transportation * 0.2);
    }

    // Check accommodation
    if (breakdown.accommodation > allocated * 0.45) {
      suggestions.push(
        `Lodging takes ${Math.round((breakdown.accommodation / allocated) * 100)}% of your budget. Switching to a boutique neighborhood guest house or highly rated hostel private room can save 20-30%.`
      );
      potentialSavings += Math.round(breakdown.accommodation * 0.25);
    }

    // Check food & dining
    if (breakdown.foodAndDining > allocated * 0.3) {
      suggestions.push(
        `Dining accounts for ${Math.round((breakdown.foodAndDining / allocated) * 100)}% of expenses. Opt for artisanal bakeries and local food hall lunch specials instead of multi-course dinners.`
      );
      potentialSavings += Math.round(breakdown.foodAndDining * 0.15);
    }

    // Default suggestions if budget is already well-balanced
    if (suggestions.length === 0) {
      suggestions.push('Your budget is nicely balanced across categories!');
      suggestions.push('Look for free museum admission days (often Fridays or the first weekend of each month).');
      suggestions.push('Take advantage of scenic walking tours and public scenic viewpoints over paid observation decks.');
    }

    return NextResponse.json({
      success: true,
      potentialSavings,
      currency: breakdown.currency,
      suggestions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to optimize budget' },
      { status: 500 }
    );
  }
}
