const express = require('express');
const router = express.Router();

const homeController = require('../controllers/front/homeController.js');
const propertyController = require('../controllers/front/propertyController.js');
const verifyUserToken = require('../middleware/authMiddleware.js');

// Seo routes
router.get('/seo/:slug', homeController.getSeoDetails);

router.get('/languages', homeController.getLanguages);
router.get('/currencies', homeController.getCurrencies);
router.get('/fees', homeController.getFees);
router.get('/popular-city', homeController.getPopularCity);
router.get('/help-categories', homeController.getHelpCategoriesData);
router.get('/helps/:categoryId', homeController.getHelpsData);
router.get('/help/:slug', homeController.getSingleHelpData);
router.get('/user/:id', homeController.getUser);

// Notifications
router.get('/notifications', verifyUserToken, homeController.getNotifications);
router.post('/notifications/mark-as-read', verifyUserToken, homeController.notificationsMarkAsRead);


//properties
router.get('/property/:id', propertyController.getProperty);
router.get('/reviews/:propertyId/{:take}', propertyController.getReviewsByProperty);
router.get('/filtered-properties', propertyController.getFilteredProperties);
router.get('/property-types', propertyController.getPropertyTypes);
router.get('/space-types', propertyController.getSpaceTypes);
router.get('/property-by-city', propertyController.getPropertyByCity);
router.get('/amenities', propertyController.getAmenities);

module.exports = router;
