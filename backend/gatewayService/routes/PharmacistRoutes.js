const express = require('express');
const { verifyToken } = require('../Utils/verifyToken');
const { pharmacistTestRoute, fulfillPrescription, viewPrescription, viewPharmacist } = require('../controllers/PharmacistController');

// define a router
const router = express.Router();

// API routes
router.get('/test', pharmacistTestRoute);
router.post('/fulfillPrescription', verifyToken, fulfillPrescription);
router.get('/viewPrescription/:prescriptionId', verifyToken, viewPrescription);
router.get('/profile', verifyToken, viewPharmacist);

// export the Pharmacists route
module.exports = router;