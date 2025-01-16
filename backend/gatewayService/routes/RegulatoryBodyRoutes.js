const express = require('express');
const { viewAllPrescriptions, resolveFlaggedPrescription } = require('../controllers/RegulatoryBodyController');

// define a router
const router = express.Router();

// API routes
// ################ 
// view all prescriptions route
router.get('/viewAllPrescriptions', viewAllPrescriptions);
router.post('/resolveFlaggedPrescription', resolveFlaggedPrescription);


// export the RegulatoryBody route
module.exports = router;