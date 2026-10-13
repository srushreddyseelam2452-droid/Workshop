import jsPDF from 'jspdf';
import { TripItinerary } from '@/types/trip';

export function exportItineraryToPDF(trip: TripItinerary): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header banner background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Title & Destination
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(trip.title, margin, 16, { maxWidth: contentWidth });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Destination: ${trip.destination} | Origin: ${trip.origin} | Dates: ${trip.startDate} to ${trip.endDate}`, margin, 26);
  doc.text(`Duration: ${trip.durationDays} Days | Status: ${trip.status.toUpperCase()} | Travelers: ${trip.preferences?.travelers || 1}`, margin, 34);

  y = 50;

  // Overview box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Trip Overview & Budget', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const budgetText = `Allocated Budget: ${trip.budget.breakdown.currency} ${trip.budget.allocated.toLocaleString()} | Estimated Cost: ${trip.budget.breakdown.currency} ${trip.budget.breakdown.totalEstimated.toLocaleString()} (${trip.budget.breakdown.isUnderBudget ? 'Under Budget' : 'Over Budget'})`;
  doc.text(budgetText, margin + 4, y + 14);

  const costPersonText = `Cost per Person: ${trip.budget.breakdown.currency} ${trip.budget.breakdown.costPerPerson.toLocaleString()} | Pace: ${trip.preferences?.pace || 'Moderate'}`;
  doc.text(costPersonText, margin + 4, y + 20);

  y += 32;

  // Highlights
  if (trip.highlights && trip.highlights.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Trip Highlights', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    for (const h of trip.highlights) {
      checkPageBreak(8);
      doc.text(`•  ${h}`, margin + 2, y, { maxWidth: contentWidth - 4 });
      y += 6;
    }
    y += 4;
  }

  // Day by Day Schedule
  checkPageBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.text('Day-by-Day Schedule', margin, y);
  y += 8;

  trip.days.forEach((day) => {
    checkPageBreak(25);

    // Day Header
    doc.setFillColor(224, 242, 254); // sky-100
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(3, 105, 161); // sky-700
    doc.text(`${day.title} (${day.date})`, margin + 3, y + 5.5);
    y += 12;

    // Day Theme
    if (day.theme) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Theme: ${day.theme}`, margin + 3, y);
      y += 6;
    }

    // Activities
    day.activities.forEach((act) => {
      checkPageBreak(22);

      // Activity time & title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const actTitle = `[${act.time}] ${act.title} (${act.category.toUpperCase()} - ${trip.budget.breakdown.currency} ${act.estimatedCost})`;
      doc.text(actTitle, margin + 4, y, { maxWidth: contentWidth - 8 });
      y += 5;

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(`Location: ${act.location} | Duration: ${act.duration}\n${act.description}`, contentWidth - 8);
      doc.text(descLines, margin + 4, y);
      y += descLines.length * 4.2;

      // Tips if any
      if (act.tips) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9); // amber-700
        const tipLines = doc.splitTextToSize(`Pro Tip: ${act.tips}`, contentWidth - 8);
        doc.text(tipLines, margin + 4, y);
        y += tipLines.length * 4;
      }

      y += 3;
    });

    y += 4;
  });

  // Budget Breakdown Section
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Category-wise Budget Breakdown', margin, y);
  y += 6;

  const b = trip.budget.breakdown;
  const curr = b.currency;
  const categories = [
    { name: 'Transportation', amount: b.transportation },
    { name: 'Accommodation', amount: b.accommodation },
    { name: 'Food & Dining', amount: b.foodAndDining },
    { name: 'Activities & Attractions', amount: b.activitiesAndAttractions },
    { name: 'Miscellaneous & Buffer', amount: b.miscellaneous },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  categories.forEach((cat) => {
    checkPageBreak(6);
    doc.text(`• ${cat.name}: ${curr} ${cat.amount.toLocaleString()}`, margin + 3, y);
    y += 5;
  });

  y += 6;

  // Travel Tips
  if (trip.travelTips && trip.travelTips.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Important Travel & Insider Tips', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    trip.travelTips.forEach((tip) => {
      checkPageBreak(8);
      const tipLines = doc.splitTextToSize(`• ${tip}`, contentWidth - 6);
      doc.text(tipLines, margin + 3, y);
      y += tipLines.length * 4.5;
    });
  }

  // Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated by Weekend Getaway Itinerary Builder | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Save / trigger download
  const sanitizedFilename = trip.destination.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  doc.save(`itinerary_${sanitizedFilename}_${trip.startDate}.pdf`);
}
