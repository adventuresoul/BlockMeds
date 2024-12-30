const express = require('express');
const { patientTestRoute, registerPatient } = require('../controllers/PatientControllers');

// defining router
const router = express.Router();

// API routes

// patient sample-test route
router.get('/test', patientTestRoute);

router.post('/register', registerPatient);


// export the Patient route
module.exports = router;

