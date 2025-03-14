// PatientControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');

const Patient = require("../models/PatientModel");
const Prescription = require("../models/PrescriptionModel");
const Diagnosis = require("../models/DiagnosisModel");

require('dotenv').config(); // Load environment variables

// get URL for authentication service
const authServiceURL = process.env.AUTH_SERVICE_URL;

// ######################## Endpoints ######################## 

// simple test route
const patientTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Patient Test Route Working!' });
});
/**
 * @async
 * @function viewPatient
 * @description Fetches a patient's details, including their prescription history with diagnosis details.
 * @param {Object} req - Express request object containing user information in `req.user`.
 * @param {Object} res - Express response object used to return patient data.
 * @returns {Object} - Patient details along with enriched prescription history.
 */
const viewPatient = asyncHandler(async (req, res) => {
    try {
        // Get the ID of the patient from the token
        const patientId = req.user.userId;

        // Find the patient
        const patient = await Patient.findById(patientId).lean();
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
    
        // Fetch prescriptions using prescriptionHistory IDs
        const prescriptions = await Prescription.find({ _id: { $in: patient.prescriptionHistory } }).lean();
       
        // Fetch diagnosis details for each prescription
        const diagnosisIds = prescriptions.map(p => p.diagnosisId);
        const diagnoses = await Diagnosis.find({ diagnosisId: { $in: diagnosisIds } }).lean();

        // Map diagnosis details to prescriptions
        const prescriptionsWithDiagnosis = prescriptions.map(prescription => ({
            ...prescription,
            diagnosis: diagnoses.find(d => d.diagnosisId === prescription.diagnosisId) || null
        }));

        // Return patient data with detailed prescriptions
        res.status(200).json({
            ...patient,
            prescriptionHistory: prescriptionsWithDiagnosis
        });

    } catch (error) {
        console.error("Error fetching patient details:", error);
        res.status(500).json({ message: "An error occurred while fetching patient details." });
    }
});



module.exports = { patientTestRoute, viewPatient };






















