const verifyUserToken = require('../middleware/authMiddleware');
const sslcommerzController = require('../controllers/payment/sslcommerzController');
const express = require('express');
const router = express.Router();

router.post('/init-payment', verifyUserToken, sslcommerzController.initPayment);
router.post('/payment-success', sslcommerzController.paymentSuccess);
router.post('/payment-fail', sslcommerzController.paymentFail);
router.post('/payment-cancel', sslcommerzController.paymentCancel);
router.post('/payment-ipn', sslcommerzController.paymentIPN);

module.exports = router;
