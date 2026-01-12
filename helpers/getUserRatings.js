const prisma = require('../config/prisma');

async function getUserRatings(booking) {
  let guestOverallRating = null;
  let hostOverallRating = null;
  let guestReviewCount = 0;
  let hostReviewCount = 0;
  let guestTripsCount = 0;
  let guestCategoryRatings = {};
  let hostCategoryRatings = {};

  // ---------------- Guest Ratings ----------------
  if (booking?.guest?.id) {
    const guestId = booking.guest.id;

    // --- Overall + Count ---
    const guestAgg = await prisma.reviews.aggregate({
      where: { receiverId: guestId },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    guestOverallRating = guestAgg._avg.overallRating ? parseFloat(guestAgg._avg.overallRating.toFixed(1)) : null;

    guestReviewCount = guestAgg._count.id;

    // --- Trip Count ---
    guestTripsCount = await prisma.booking.count({
      where: { guestId, bookingStatus: 'CONFIRMED' },
    });

    // --- Category Ratings ---
    if (booking.guest.reviewsReceived?.length) {
      const ratingSums = {};
      const ratingCounts = {};

      booking.guest.reviewsReceived.forEach((review) => {
        if (Array.isArray(review.ratings)) {
          review.ratings.forEach((rating) => {
            if (rating.category && rating.score != null) {
              const score = parseFloat(rating.score);
              if (!isNaN(score)) {
                ratingSums[rating.category] = (ratingSums[rating.category] || 0) + score;
                ratingCounts[rating.category] = (ratingCounts[rating.category] || 0) + 1;
              }
            }
          });
        }
      });

      guestCategoryRatings = Object.fromEntries(Object.entries(ratingSums).map(([key, sum]) => [key, parseFloat((sum / ratingCounts[key]).toFixed(1))]));
    }
  }

  // ---------------- Host Ratings ----------------
  if (booking?.host?.id) {
    const hostId = booking.host.id;

    // --- Overall + Count ---
    const hostAgg = await prisma.reviews.aggregate({
      where: { receiverId: hostId },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    hostOverallRating = hostAgg._avg.overallRating ? parseFloat(hostAgg._avg.overallRating.toFixed(1)) : null;

    hostReviewCount = hostAgg._count.id;

    // --- Category Ratings ---
    if (booking.host.reviewsReceived?.length) {
      const ratingSums = {};
      const ratingCounts = {};

      booking.host.reviewsReceived.forEach((review) => {
        if (Array.isArray(review.ratings)) {
          review.ratings.forEach((rating) => {
            if (rating.category && rating.score != null) {
              const score = parseFloat(rating.score);
              if (!isNaN(score)) {
                ratingSums[rating.category] = (ratingSums[rating.category] || 0) + score;
                ratingCounts[rating.category] = (ratingCounts[rating.category] || 0) + 1;
              }
            }
          });
        }
      });

      hostCategoryRatings = Object.fromEntries(Object.entries(ratingSums).map(([key, sum]) => [key, parseFloat((sum / ratingCounts[key]).toFixed(1))]));
    }
  }

  // ---------------- Return Combined Data ----------------
  return {
    guestOverallRating,
    guestReviewCount,
    guestTripsCount,
    guestCategoryRatings,
    hostOverallRating,
    hostReviewCount,
    hostCategoryRatings,
  };
}

module.exports = { getUserRatings };
