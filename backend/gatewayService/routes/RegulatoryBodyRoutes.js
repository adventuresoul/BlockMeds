const express = require('express');
const { viewAllPrescriptions, resolveFlaggedPrescription, loginAdmin, setSafeLimit, getSafeLimit, addDiagnosis, findDoctorByPublicKey } = require('../controllers/RegulatoryBodyController');
const { authenticateAdmin } = require('../Utils/adminAuth');

// define a router
const router = express.Router();

// API routes
// ################ 
// view all prescriptions route
router.post('/login', loginAdmin);
router.post('/setSafeLimit', authenticateAdmin, setSafeLimit);
router.get('/getSafeLimit/:drug', authenticateAdmin, getSafeLimit);
router.get('/viewAllPrescriptions', authenticateAdmin, viewAllPrescriptions);
router.post('/resolveFlaggedPrescription', authenticateAdmin, resolveFlaggedPrescription);
router.post('/addDiagnosis', authenticateAdmin, addDiagnosis);
router.get('/findDoctorByEthPublicKey/:ethPubKey', authenticateAdmin, findDoctorByPublicKey);

// export the RegulatoryBody route
module.exports = router;