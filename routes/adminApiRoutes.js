const express = require('express');
const router = express.Router();
const path = require('path');
const { upload } = require('../config/multerConfig.js');

const roleController = require('../controllers/admin/roleController.js');
const permissionController = require('../controllers/admin/permissionController.js');
const userConrtoller = require('../controllers/admin/userConrtoller.js');
const stafConrtoller = require('../controllers/admin/stafConrtoller.js');
const countryController = require('../controllers/admin/countryController.js');
const cityController = require('../controllers/admin/cityController.js');
const currencyController = require('../controllers/admin/currencyController.js');
const pageController = require('../controllers/admin/pageController.js');
const logsController = require('../controllers/admin/logsController.js');
const adminLogsController = require('../controllers/admin/adminLogsController.js');
const payoutMethodController = require('../controllers/admin/payoutMethodController.js');
const payoutController = require('../controllers/admin/payoutController.js');
const paymentController = require('../controllers/admin/paymentController.js');
const walletController = require('../controllers/admin/walletController.js');
const reviewController = require('../controllers/admin/reviewController.js');
const faqController = require('../controllers/admin/faqController.js');
const helpCategoryController = require('../controllers/admin/helpCategoryController.js');
const helpController = require('../controllers/admin/helpController.js');
const contactController = require('../controllers/admin/contactController.js');
const cancellationPolicyController = require('../controllers/admin/cancellationPolicyController.js');
const emailSettingsController = require('../controllers/admin/emailSettingsController.js');
const emailTemplatesController = require('../controllers/admin/emailTemplatesController.js');
const feesController = require('../controllers/admin/feesController.js');
const paymentMethodsController = require('../controllers/admin/paymentMethodsController.js');
const languageController = require('../controllers/admin/languageController.js');
const translationController = require('../controllers/admin/translationController.js');
const amenityTypeController = require('../controllers/admin/amenityTypeController.js');
const amenityController = require('../controllers/admin/amenityController.js');
const bookingController = require('../controllers/admin/bookingController.js');
const propertyController = require('../controllers/admin/propertyController.js');
const propertyTypeController = require('../controllers/admin/propertyTypeController.js');
const spaceTypeController = require('../controllers/admin/spaceTypeController.js');
const stateController = require('../controllers/admin/stateController.js');
const bedTypeController = require('../controllers/admin/bedTypeController.js');
const conversationController = require('../controllers/admin/conversationController.js');
const { optimizeImage } = require('../helpers/optimizeImage.js');

// Route: POST /admin/image-upload
router.post('/tinymce/image-upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const optimizedPath = await optimizeImage(req.file.path);
    const fileName = path.basename(optimizedPath);
    const imageUrl = `/uploads/${fileName}`;

    return res.json({ location: imageUrl });
  } catch (err) {
    console.error('Image optimization error:', err);
    return res.status(500).json({ error: 'Image optimization failed' });
  }
});

router.get('/roles',  roleController.getRoles);
router.get('/roles/:id', roleController.getRole);
router.post('/roles', roleController.createRole);
router.put('/roles/:id', roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);

router.get('/permissions', permissionController.getPermissions);
router.get('/permissions/:id', permissionController.getPermission);
router.post('/permissions', permissionController.createPermission);
router.put('/permissions/:id', permissionController.updatePermission);
router.delete('/permissions/:id', permissionController.deletePermission);

router.get('/users', userConrtoller.getUsers);
router.get('/users/:id', userConrtoller.getUser);
router.post('/users', userConrtoller.createUser);
router.put('/users/:id', userConrtoller.updateUser);
router.delete('/users/:id', userConrtoller.deleteUser);
router.put('/user/verify/:id', userConrtoller.userVerify);

router.get('/user/verification-documents/:id', userConrtoller.getVerificationDocuments);

router.get('/stafs', stafConrtoller.getStafs);
router.get('/stafs/:id', stafConrtoller.getStaf);
router.post('/stafs', stafConrtoller.createStaf);
router.put('/stafs/:id', stafConrtoller.updateStaf);
router.delete('/stafs/:id', stafConrtoller.deleteStaf);

router.get('/bookings', bookingController.getBookings);
router.get('/bookings/:id', bookingController.getBooking);
router.post('/bookings', bookingController.createBooking);
router.put('/bookings/:id', bookingController.updateBooking);
router.delete('/bookings/:id', bookingController.deleteBooking);

router.get('/properties', propertyController.getProperties);
router.get('/properties/:id', propertyController.getProperty);
router.post('/properties', propertyController.createProperty);
router.put('/properties/:id', propertyController.updateProperty);
router.put('/properties/:id/description', propertyController.updatePropertyDescription);
router.put('/properties/:id/details', propertyController.updatePropertyDetails);
router.put('/properties/:id/location', propertyController.updatePropertyLocation);
router.put('/properties/:id/amenity', propertyController.updatePropertyAmenity);
router.put('/properties/:id/photos', propertyController.updatePropertyPhotos);
router.put('/properties/:id/pricing', propertyController.updatePropertyPricing);
router.put('/properties/:id/rules', propertyController.updatePropertyTermsAndRules);
router.put('/properties/:id/booking', propertyController.updatePropertyBooking);
router.put('/properties/:id/calender', propertyController.updatePropertyCalender);
router.put('/properties/:id/actions', propertyController.updatePropertyActions);
router.post('/properties/update/date-wise-price', propertyController.updatePropertyDateWisePrice);
router.delete('/properties/:id', propertyController.deleteProperty);

router.get('/property-types', propertyTypeController.getPropertyTypes);
router.get('/property-types/:id', propertyTypeController.getPropertyType);
router.post('/property-types', propertyTypeController.createPropertyType);
router.put('/property-types/:id', propertyTypeController.updatePropertyType);
router.delete('/property-types/:id', propertyTypeController.deletePropertyType);

router.get('/space-types', spaceTypeController.getSpaceTypes);
router.get('/space-types/:id', spaceTypeController.getSpaceType);
router.post('/space-types', spaceTypeController.createSpaceType);
router.put('/space-types/:id', spaceTypeController.updateSpaceType);
router.delete('/space-types/:id', spaceTypeController.deleteSpaceType);

router.get('/bed-types', bedTypeController.getBedTypes);
router.get('/bed-types/:id', bedTypeController.getBedType);
router.post('/bed-types', bedTypeController.createBedType);
router.put('/bed-types/:id', bedTypeController.updateBedType);
router.delete('/bed-types/:id', bedTypeController.deleteBedType);

router.get('/payment-methods', paymentMethodsController.getPaymentMethods);
router.get('/payment-methods/:id', paymentMethodsController.getPaymentMethod);
router.post('/payment-methods', paymentMethodsController.createPaymentMethod);
router.put('/payment-methods/:id', paymentMethodsController.updatePaymentMethod);
router.delete('/payment-methods/:id', paymentMethodsController.deletePaymentMethod);

router.get('/fees', feesController.getFees);
router.get('/fees/:id', feesController.getFee);
router.post('/fees', feesController.createFee);
router.put('/fees/:id', feesController.updateFee);
router.delete('/fees/:id', feesController.deleteFee);

router.get('/cancellation-policy', cancellationPolicyController.getCancellationPolicies);
router.get('/cancellation-policy/:id', cancellationPolicyController.getCancellationPolicy);
router.post('/cancellation-policy', cancellationPolicyController.createCancellationPolicy);
router.put('/cancellation-policy/:id', cancellationPolicyController.updateCancellationPolicy);
router.delete('/cancellation-policy/:id', cancellationPolicyController.deleteCancellationPolicy);

router.get('/email-settings', emailSettingsController.getCancellationPolicies);
router.get('/email-settings/:id', emailSettingsController.getCancellationPolicy);
router.post('/email-settings', emailSettingsController.createCancellationPolicy);
router.put('/email-settings/:id', emailSettingsController.updateCancellationPolicy);
router.delete('/email-settings/:id', emailSettingsController.deleteCancellationPolicy);

router.get('/email-templates', emailTemplatesController.getCancellationPolicies);
router.get('/email-templates/:id', emailTemplatesController.getCancellationPolicy);
router.post('/email-templates', emailTemplatesController.createCancellationPolicy);
router.put('/email-templates/:id', emailTemplatesController.updateCancellationPolicy);
router.delete('/email-templates/:id', emailTemplatesController.deleteCancellationPolicy);

router.get('/countries', countryController.getCountries);
router.get('/countries/:id', countryController.getCountry);
router.post('/countries', countryController.createCountry);
router.put('/countries/:id', countryController.updateCountry);
router.delete('/countries/:id', countryController.deleteCountry);

router.get('/states', stateController.getStates);
router.get('/states/:id', stateController.getState);
router.post('/states', stateController.createState);
router.put('/states/:id', stateController.updateState);
router.delete('/states/:id', stateController.deleteState);

router.get('/cities', cityController.getCities);
router.get('/cities/:id', cityController.getCity);
router.post('/cities', cityController.createCity);
router.put('/cities/:id', cityController.updateCity);
router.delete('/cities/:id', cityController.deleteCity);

router.get('/amenity-types', amenityTypeController.getAmenityTypes);
router.get('/amenity-types/:id', amenityTypeController.getAmenityType);
router.post('/amenity-types', amenityTypeController.createAmenityType);
router.put('/amenity-types/:id', amenityTypeController.updateAmenityType);
router.delete('/amenity-types/:id', amenityTypeController.deleteAmenityType);

router.get('/amenities', amenityController.getAmenities);
router.get('/amenities/:id', amenityController.getAmenity);
router.post('/amenities', amenityController.createAmenity);
router.put('/amenities/:id', amenityController.updateAmenity);
router.delete('/amenities/:id', amenityController.deleteAmenity);

router.get('/currencies', currencyController.getCurrencies);
router.get('/currencies/:id', currencyController.getCurrency);
router.post('/currencies', currencyController.createCurrency);
router.put('/currencies/:id', currencyController.updateCurrency);
router.delete('/currencies/:id', currencyController.deleteCurrency);

router.get('/pages', pageController.getAllPages);
router.get('/pages/:id', pageController.getPage);
router.post('/pages', pageController.createPage);
router.put('/pages/:id', pageController.updatePage);
router.delete('/pages/:id', pageController.deletePage);

router.get('/logs', logsController.getAllLogs);
router.get('/logs/:id', logsController.getLog);
router.post('/logs', logsController.createLog);
router.put('/logs/:id', logsController.updateLog);
router.delete('/logs/:id', logsController.deleteLog);

router.get('/admin-logs', adminLogsController.getAllAdminLogs);
// router.get('/logs/:id', logsController.getLog);
// router.post('/logs', logsController.createLog);
// router.put('/logs/:id', logsController.updateLog);
// router.delete('/logs/:id', logsController.deleteLog);

router.get('/wallets', walletController.getAllWallets);
router.get('/wallets/:id', walletController.getWallet);
router.post('/wallets', walletController.createWallet);
router.put('/wallets/:id', walletController.updateWallet);
router.delete('/wallets/:id', walletController.deleteWallet);

router.get('/payouts', payoutController.getAllPayouts);
router.get('/payouts/:id', payoutController.getPayout);
router.post('/payouts', payoutController.createPayout);
router.put('/payouts/:id', payoutController.updatePayout);
router.delete('/payouts/:id', payoutController.deletePayout);

router.get('/payout-methods', payoutMethodController.getAllPayoutMethods);
router.get('/payout-methods/:id', payoutMethodController.getPayoutMethod);
router.post('/payout-methods', payoutMethodController.createPayoutMethod);
router.put('/payout-methods/:id', payoutMethodController.updatePayoutMethod);
router.delete('/payout-methods/:id', payoutMethodController.deletePayoutMethod);

router.get('/payments', paymentController.getAllPayments);
router.get('/payments/:id', paymentController.getPayment);
router.post('/payments', paymentController.createPayment);
router.put('/payments/:id', paymentController.updatePayment);
router.delete('/payments/:id', paymentController.deletePayment);

router.get('/reviews', reviewController.getAllReviews);
router.get('/reviews/:id', reviewController.getReview);
router.post('/reviews', reviewController.createReview);
router.put('/reviews/:id', reviewController.updateReview);
router.delete('/reviews/:id', reviewController.deleteReview);

router.get('/faqs', faqController.getAllFaqs);
router.get('/faqs/:id', faqController.getFaq);
router.post('/faqs', faqController.createFaq);
router.put('/faqs/:id', faqController.updateFaq);
router.delete('/faqs/:id', faqController.deleteFaq);

router.get('/help-categories', helpCategoryController.getAllHelpCategories);
router.get('/help-categories/:id', helpCategoryController.getHelpCategory);
router.post('/help-categories', helpCategoryController.createHelpCategory);
router.put('/help-categories/:id', helpCategoryController.updateHelpCategory);
router.delete('/help-categories/:id', helpCategoryController.deleteHelpCategory);

router.get('/helps', helpController.getAllHelps);
router.get('/helps/:id', helpController.getHelp);
router.post('/helps', helpController.createHelp);
router.put('/helps/:id', helpController.updateHelp);
router.delete('/helps/:id', helpController.deleteHelp);

router.get('/contacts', contactController.getAllContacts);
router.get('/contacts/:id', contactController.getContact);
router.post('/contacts', contactController.createContact);
router.put('/contacts/:id', contactController.updateContact);
router.delete('/contacts/:id', contactController.deleteContact);

router.get('/languages', languageController.getAllLanguages);
router.get('/languages/:id', languageController.getLanguageById);
router.post('/languages', languageController.createLanguage);
router.put('/languages/:id', languageController.updateLanguage);
router.delete('/languages/:id', languageController.deleteLanguage);

router.get('/translations', translationController.getTranslations);
router.post('/translations/sync-keys', translationController.syncTranslationKys);
router.put('/translations/:id', translationController.updateTranslation);

router.get('/conversations', conversationController.getAllConversation);
router.get('/conversation/:conversationId', conversationController.getConversationById);

module.exports = router;
