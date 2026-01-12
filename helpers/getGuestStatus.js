const { addDays, differenceInDays } = require('date-fns');

async function getGuestStatus(booking, user, isAvailable = true) {
  let guestStatus = '';
  let reviewDeadline = null;
  let canReview = false;
  let reviewFromGuest = null;
  let reviewFromHost = null;

  if (!booking?.guest?.id || !booking?.host?.id) return { guestStatus: 'Invalid Booking' };

  const guestId = booking.guest.id;
  const hostId = booking.host.id;
  const now = new Date();

  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);

  // Find reviews
  reviewFromHost = booking.reviews?.find((r) => r.senderId === hostId && r.receiverId === guestId) || null;
  reviewFromGuest = booking.reviews?.find((r) => r.senderId === guestId && r.receiverId === hostId) || null;

  const deadline = addDays(end, 15);
  const daysLeft = differenceInDays(deadline, now);

  const isHost = user.id === hostId;
  const isGuest = user.id === guestId;

  // --- Common booking type logic ---
  if (booking.bookingType === 'INQUIRY') {
    guestStatus = 'Inquiry Sent';
  } else if (booking.bookingType === 'REQUEST') {
    guestStatus = 'Booking Request';
  }

  if (booking.bookingStatus === 'DECLINED') {
    guestStatus = `Declined by ${booking.declinedBy}`;
  }

  // --- Availability check ---
  if (start > now && !isAvailable) {
    guestStatus = 'Dates are not available';
  }

  // --- Detailed status logic ---
  if (booking.bookingType === 'BOOKING') {
    const active = start <= now && end >= now;
    const past = end < now;
    const upcoming = start > now;

    if (isHost) {
      if (upcoming) guestStatus = 'Upcoming Hosting';
      else if (active) guestStatus = 'Currently Hosting';
      else if (past) guestStatus = 'Past Guest';

      if (past) {
        if (!reviewFromHost && daysLeft > 0) {
          guestStatus = 'Review Guest';
          reviewDeadline = daysLeft;
          canReview = true;
        } else {
          guestStatus = 'Past Guest';
        }
      }
    }

    if (isGuest) {
      if (upcoming) guestStatus = 'Upcoming Stay';
      else if (active) guestStatus = 'Currently Staying';
      else if (past) guestStatus = 'Past Guest';

      if (past) {
        if (!reviewFromGuest && daysLeft > 0) {
          guestStatus = 'Review Host';
          reviewDeadline = daysLeft;
          canReview = true;
        } else {
          guestStatus = 'Past Guest';
        }
      }
    }
  }

  return {
    guestStatus,
    reviewDeadline,
    canReview,
    reviewFromGuest,
    reviewFromHost,
  };
}

module.exports = { getGuestStatus };
