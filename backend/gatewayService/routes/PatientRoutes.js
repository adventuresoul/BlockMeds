const express = require('express');
const { patientTestRoute, viewPatient } = require('../controllers/PatientControllers');
const { verifyToken } = require('../Utils/verifyToken');

// defining router
const router = express.Router();

// ######################## Endpoints ########################
router.get('/test', patientTestRoute);
router.get('/profile', verifyToken, viewPatient);   

// export the Patient route
module.exports = router;

