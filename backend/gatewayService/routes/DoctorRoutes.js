const express = require('express');
const { verifyToken } = require('../Utils/verifyToken');

const { doctorTestRoute, createPrescription, getDoctorProfile, getDoctorPrescriptionHistory, getPatientProfile } = require('../controllers/DoctorControllers');

// defining router
const router = express.Router();

// API routes
router.get('/test', doctorTestRoute);
router.post('/createPrescription', verifyToken, createPrescription);
router.get('/profile', verifyToken, getDoctorProfile);
router.get('/prescriptionHistory', verifyToken, getDoctorPrescriptionHistory);
router.post('/patientProfile', verifyToken, getPatientProfile);

// export the Doctors route
module.exports = router;