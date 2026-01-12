const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/guest/bookingController.js');
const wishlistController = require('../controllers/guest/wishlistController.js');
const verifyUserToken = require('../middleware/authMiddleware.js');

// Guest Bookings
router.get('/bookings', verifyUserToken, bookingController.getBookings);
router.get('/booking-details/:bookingId', verifyUserToken, bookingController.getBookingDetails);

// Property Booking
router.post('/property-booking', verifyUserToken, bookingController.propertyBooking);

// Property Inquiry
router.post('/property-inquiry', verifyUserToken, bookingController.propertyInquiry);

// Request Booking
router.post('/request-booking', verifyUserToken, bookingController.requestBooking);

// Confirm Booking
router.post('/confirm-booking', verifyUserToken, bookingController.confirmBooking);

router.post('/add-review', verifyUserToken, bookingController.addReview);

// Decline
router.put('/decline-booking-request/:bookingId', verifyUserToken, bookingController.declineBookingRequest);

// Wishlist
router.post('/add-recently-viewed', verifyUserToken, wishlistController.addRecentlyViewed);
router.get('/recently-viewed', verifyUserToken, wishlistController.getRecentlyViewed);
router.post('/add-wishlist/:propertyId', verifyUserToken, wishlistController.addWishlist);
router.delete('/remove-wishlist/:propertyId', verifyUserToken, wishlistController.removeWishlist);
router.get('/wishlists', verifyUserToken, wishlistController.getWishlist);

router.get('/payments', verifyUserToken, bookingController.getPaymentsData);

module.exports = router;
