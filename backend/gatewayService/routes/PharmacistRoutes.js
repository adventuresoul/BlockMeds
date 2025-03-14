const express = require('express');
const { verifyToken } = require('../Utils/verifyToken');
const { pharmacistTestRoute, fulfillPrescription, viewPrescription, viewPharmacist, getPatientProfile } = require('../controllers/PharmacistController');
const { authenticateAdmin } = require('../Utils/adminAuth');

// define a router
const router = express.Router();

// API routes
router.get('/test', pharmacistTestRoute);
router.post('/fulfillPrescription', verifyToken, fulfillPrescription);
router.get('/viewPrescription/:prescriptionId', verifyToken, viewPrescription);
router.get('/profile', verifyToken, viewPharmacist);
router.get('/getPatientProfile/:contactNumber', verifyToken, getPatientProfile);

// export the Pharmacists route
module.exports = router;