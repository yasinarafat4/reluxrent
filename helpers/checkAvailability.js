
const { format, startOfDay, addDays, addHours, differenceInDays } = require('date-fns');

async function checkAvailability(booking) {
  let isAvailable = true;
  const today = startOfDay(new Date());
  let lastBookingDates = [];

  // --- Collect all dates from booking range ---
  if (booking?.startDate && booking?.endDate) {
    const start = startOfDay(new Date(booking.startDate));
    const end = startOfDay(new Date(booking.endDate));

    for (let d = start; d <= end; d = addDays(d, 1)) {
      lastBookingDates.push(format(d, 'yyyy-MM-dd'));
    }
  }

  // If booking has no valid dates, fallback to today
  if (lastBookingDates.length === 0) {
    lastBookingDates = [format(today, 'yyyy-MM-dd')];
  }

  // --- Collect booked and disabled dates ---
  const bookedDates = new Set(
    booking?.property?.bookings?.flatMap((b) =>
      (b.bookingDates || []).map((bd) =>
        format(startOfDay(new Date(bd.date)), 'yyyy-MM-dd')
      )
    ) ?? []
  );

  const disabledDates = new Set(
    booking.property?.propertyDates
      ?.filter((d) => d.disabled)
      .map((d) => format(startOfDay(new Date(d.date)), 'yyyy-MM-dd')) ?? []
  );

  // --- Check if any overlap exists ---
  const isBooked = lastBookingDates.some((d) => bookedDates.has(d));
  const isDisabled = lastBookingDates.some((d) => disabledDates.has(d));

  isAvailable = !(isBooked || isDisabled);

  return { isAvailable, lastBookingDates, isBooked, isDisabled };
}

module.exports = { checkAvailability };