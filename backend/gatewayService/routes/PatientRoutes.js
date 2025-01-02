const express = require('express');
const { patientTestRoute, registerPatient, loginPatient } = require('../controllers/PatientControllers');

// defining router
const router = express.Router();

// API routes

// patient sample-test route
router.get('/test', patientTestRoute);
router.post('/register', registerPatient);
router.post('/login', loginPatient);

// export the Patient route
module.exports = router;

