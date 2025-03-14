// PharmacistControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const pharmacistModel = require("../models/PharmacistModel");
const Prescription = require("../models/PrescriptionModel");
const Patient = require("../models/PatientModel");
require('dotenv').config(); // Load environment variables

// get URL for authentication service
const authServiceURL = process.env.AUTH_SERVICE_URL;
// get URL for contract service
const contractServiceURL = process.env.CONTRACT_SERVICE_URL;
// get API key for contract service 
const contractServiceAPIKey = process.env.CONTRACT_SERVICE_API_KEY;

// ######################## Endpoints ######################## 
/** 
 * @async
 * @function pharmacistTestRoute
 * @description test route for /doctor
**/ 
const pharmacistTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Pharmacist Test Route Working!' });
});

/**
 * @description Retrieves the authenticated pharmacist's profile.
 * @route GET /viewPharmacist
 * @access Private (Pharmacists only)
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.roleId - Role ID of the authenticated user
 * @param {string} req.user.userId - Unique ID of the pharmacist
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing pharmacist details (excluding sensitive data)
 */
const viewPharmacist = asyncHandler(async (req, res) => {
    if (req.user.roleId !== 2) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    try {
        const pharmacist = await pharmacistModel.findById(req.user.userId).select(
            "-_id -password -__v -createdAt -updatedAt"
        );

        if (!pharmacist) {
            return res.status(404).json({ message: "Pharmacist not found" });
        }

        return res.status(200).json(pharmacist);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred" });
    }
});


/**
 * @description Retrieves a prescription from the contract service.
 * @route GET /viewPrescription/:prescriptionId
 * @access Private (Pharmacists only)
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.roleId - Role ID of the authenticated user
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.prescriptionId - ID of the prescription to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the prescription details
 */
const viewPrescription = asyncHandler(async (req, res) => {
    if (req.user.roleId !== 2) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const { prescriptionId } = req.params;

    if (!prescriptionId) {
        return res.status(400).json({ message: "Please provide prescriptionId" });
    }

    try {
        const response = await axios.get(`${contractServiceURL}/viewPrescription/${prescriptionId}`, {
            headers: { Authorization: contractServiceAPIKey },
        });

        return res.status(response.status).json(response.data);
    } catch (error) {
        return res.status(error.response?.status || 500).json({
            message: error.response?.data || "An error occurred while fetching the prescription",
        });
    }
});


/**
 * @description Fulfills a prescription by a pharmacist.
 * @route POST /fulfillPrescription
 * @access Private (Pharmacists only)
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.roleId - Role ID of the authenticated user
 * @param {Object} req.body - Request body
 * @param {string} req.body.prescriptionId - ID of the prescription to fulfill
 * @param {string} req.body.pharmacistAddress - Pharmacist's blockchain address
 * @param {string} req.body.privateKey - Pharmacist's private key for signing
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating success or failure
 */
const fulfillPrescription = asyncHandler(async (req, res) => {
    if (req.user.roleId !== 2) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const { prescriptionId, pharmacistAddress, privateKey } = req.body;

    if (!prescriptionId || !pharmacistAddress || !privateKey) {
        return res.status(400).json({
            message: "Please provide prescriptionId, pharmacistAddress, and privateKey",
        });
    }

    try {
        // Call external service to fulfill the prescription
        const response = await axios.post(`${contractServiceURL}/fulfillPrescription`, req.body, {
            headers: { Authorization: contractServiceAPIKey },
        });

        if (response.status !== 200) {
            return res.status(response.status).json(response.data);
        }

        // Update the prescription as fulfilled in MongoDB
            const updatedPrescription = await Prescription.findOneAndUpdate(
                { prescriptionId },
                {
                    fulfilled: true,
                    prescriptionFulfillmentTxHash: response.data.transactionHash,
                },
                { new: true }
            );


        if (!updatedPrescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        return res.status(200).json({ success: true, message: "Prescription fulfilled successfully" });
    } catch (error) {
        console.log(error);
        return res.status(error.response?.status || 500).json({
            message: error.response?.data || "An unexpected error occurred",
        });
    }
});

/**
 * @async
 * @function getPatientProfile
 * @description Fetches a patient's details using their contact number while excluding sensitive data and only including unfulfilled prescriptions.
 * @param {Object} req - Express request object containing the patient's contact number in `req.params.contactNumber`.
 * @param {Object} res - Express response object used to return patient data.
 * @returns {Object} - Patient details with filtered prescription history.
 */
const getPatientProfile = asyncHandler(async (req, res) => {
    try {
        // Extract contact number from request parameters
        const { contactNumber } = req.params;

        // Find the patient using their contact number and exclude sensitive fields
        const patient = await Patient.findOne({ contactNumber })
            .select("-password -uniqueId -__v -createdAt -updatedAt")
            .lean();

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Ensure prescriptionHistory exists
        if (!patient.prescriptionHistory || patient.prescriptionHistory.length === 0) {
            return res.status(200).json({ ...patient, prescriptionHistory: [] });
        }

        // Fetch prescriptions and filter only unfulfilled ones
        const prescriptions = await Prescription.find({
            _id: { $in: patient.prescriptionHistory },
            fulfilled: false
        }).lean();

      
        // Return filtered patient data
        res.status(200).json({
            ...patient,
            prescriptionHistory: prescriptions
        });

    } catch (error) {
        console.error("Error fetching patient details:", error);
        res.status(500).json({ message: "An error occurred while fetching patient details." });
    }
});

module.exports = { pharmacistTestRoute, fulfillPrescription, viewPrescription, viewPharmacist, getPatientProfile };  