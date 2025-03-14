const express = require('express');
const { verifyToken } = require('../Utils/verifyToken');

const { doctorTestRoute, createPrescription, getDoctorProfile, getDoctorPrescriptionHistory, getPatientProfile, findDiagnosis, findMedicines } = require('../controllers/DoctorControllers');

// defining router
const router = express.Router();

// API routes
router.get('/test', doctorTestRoute);
router.post('/createPrescription', verifyToken, createPrescription);
router.get('/profile', verifyToken, getDoctorProfile);
router.get('/prescriptionHistory', verifyToken, getDoctorPrescriptionHistory);
router.post('/patientProfile', verifyToken, getPatientProfile);
router.get('/findDiagnosis', verifyToken, findDiagnosis);
router.get('/findMedicines', verifyToken, findMedicines);

// export the Doctors route
module.exports = router;