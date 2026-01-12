const express = require('express');
const router = express.Router();
const verifyUserToken = require('../middleware/authMiddleware.js');
const propertyController = require('../controllers/host/propertyController.js');
const bookingController = require('../controllers/host/bookingController.js');
const verificationController = require('../controllers/host/verificationController.js');
const payoutsController = require('../controllers/host/payoutsController.js');
const earningsController = require('../controllers/host/earningsController.js');

router.post('/start-verification', verifyUserToken, verificationController.startVerification);
router.post('/submit-document', verifyUserToken, verificationController.submitDocument);
router.get('/verifications-data', verifyUserToken, verificationController.getVerificationsData);

router.get('/listing-properties', verifyUserToken, propertyController.getListingProperties);
router.get('/properties/:hostId', verifyUserToken, propertyController.getPropertiesByHost);
router.get('/countries', verifyUserToken, propertyController.getCountries);
router.get('/states/:countryId', verifyUserToken, propertyController.getStatesByCountry);
router.get('/cities/:stateId', verifyUserToken, propertyController.getCitiesByState);
router.get('/property/:id', verifyUserToken, propertyController.getProperty);
router.get('/property-type', verifyUserToken, propertyController.getPropertyType);
router.get('/space-type', verifyUserToken, propertyController.getSpaceType);
router.get('/bedtypes', verifyUserToken, propertyController.getBedTypes);
router.get('/amenities', verifyUserToken, propertyController.getAmenities);
router.get('/cancellation-policy', verifyUserToken, propertyController.getCancellationPolicy);

router.post('/property/create', verifyUserToken, propertyController.addProperty);
router.post('/check-custom-link', verifyUserToken, propertyController.checkCustomLink);

router.put('/property/:id/update/property-type', verifyUserToken, propertyController.updatePropertyType);
router.put('/property/:id/update/space-type', verifyUserToken, propertyController.updateSpaceType);
router.put('/property/:id/update/location', verifyUserToken, propertyController.updateLocation);
router.put('/property/:id/update/floor-plan', verifyUserToken, propertyController.updateFloorPlan);
router.put('/property/:id/update/amenities', verifyUserToken, propertyController.updateAmenities);
router.put('/property/:id/upload/photos', verifyUserToken, propertyController.uploadPhotos);
router.put('/property/:id/photos/reorder', verifyUserToken, propertyController.reorderPhotos);
router.put('/property/:id/update/photos', verifyUserToken, propertyController.updatePhotos);
router.put('/property/:id/update/descriptions', verifyUserToken, propertyController.updatePropertyDescriptions);
router.put('/property/:id/update/booking-settings', verifyUserToken, propertyController.updateBookingSettings);
router.put('/property/:id/update/price', verifyUserToken, propertyController.updatePropertyPrice);
router.put('/property/:id/update/daily-price', verifyUserToken, propertyController.updateDailyPrice);
router.put('/property/:id/update/discounts', verifyUserToken, propertyController.updatePropertyDiscounts);
router.put('/property/:id/update/cancellation-policy', verifyUserToken, propertyController.updateCancellationPolicy);
router.put('/property/:id/update/custom-link', verifyUserToken, propertyController.updateCustomLink);
router.put('/property/:id/update/property-rules', verifyUserToken, propertyController.updatePropertyRules);
router.put('/property/:id/update/check-in-out', verifyUserToken, propertyController.updateCheckInOut);
router.put('/property/:id/update/check-in-out-instructions', verifyUserToken, propertyController.updateCheckInOutInstructions);

router.put('/property/:id/update/status', verifyUserToken, propertyController.updateStatus);
router.delete('/property/delete/image/:id', verifyUserToken, propertyController.deletePropertyImage);

router.get('/activity-logs/:userId', verifyUserToken, propertyController.getActivityLogs);

router.post('/property/:id/validate-cohost', verifyUserToken, propertyController.validateCohost);
router.put('/property/:id/invite-cohost', verifyUserToken, propertyController.invitePropertyCoHost);
router.get('/cohosts/:propertyId', verifyUserToken, propertyController.getPropertyCoHost);
router.delete('/delete-cohost/:id', verifyUserToken, propertyController.deletePropertyCoHost);
router.post('/accept-cohost-invite', verifyUserToken, propertyController.acceptCohostInvite);
router.get('/is-cohost/:id', verifyUserToken, propertyController.isCohost);

router.delete('/delete-listing/:id', verifyUserToken, propertyController.deleteListing);


router.get('/reservations', verifyUserToken, bookingController.getReservations);
router.get('/reservation-details/:bookingId', verifyUserToken, bookingController.getReservationDetails);

router.get('/todays-reservations', verifyUserToken, bookingController.getTodaysReservations);
router.get('/request-bookings', verifyUserToken, bookingController.getRequestBookings);
router.get('/follow-up-bookings', verifyUserToken, bookingController.getFollowUpBookings);
router.get('/upcoming-reservations', verifyUserToken, bookingController.getUpcomingReservations);


// Pre-Approve
router.post('/pre-approve-booking', verifyUserToken, bookingController.preApproveBooking);
router.post('/withdraw-pre-approve-booking', verifyUserToken, bookingController.withdrawPreApproveBooking);
// Special offer
router.post('/special-offer', verifyUserToken, bookingController.sendSpecialOffer);
router.post('/withdraw-special-offer', verifyUserToken, bookingController.withdrawSpecialOffer);

router.post('/add-review', verifyUserToken, bookingController.addReview);
router.get('/reviews-about-you', verifyUserToken, bookingController.getReviewsAboutYou);
router.get('/reviews-by-you', verifyUserToken, bookingController.getReviewsByYou);
router.post('/add-public-response', verifyUserToken, bookingController.addPublicResponse);
// router.get('/byYouReviews', bookingController.addReview);

// Decline
router.put('/decline-booking-request/:bookingId', verifyUserToken, bookingController.declineBookingRequest);

router.post('/add-payout-method', verifyUserToken, payoutsController.addPayoutMethod);
router.put('/update-payout-method/:id', verifyUserToken, payoutsController.updatePayoutMethod);
router.get('/payout-methods', verifyUserToken, payoutsController.getPayoutMethods);

router.get('/payments', verifyUserToken, payoutsController.getPaymentsData);

router.get('/earnings-report', verifyUserToken, earningsController.getEarningsReportData);
router.get('/earnings', verifyUserToken, earningsController.getEarningsData);

router.get('/payouts', verifyUserToken, earningsController.getPayoutsData);
router.get('/transaction-details/:confirmationCode', verifyUserToken, earningsController.getTransactionDetails);
module.exports = router;
