const asyncHandler = require("express-async-handler");
const prescriptionModel = require("../models/PrescriptionModel");
const Medicine = require("../models/MedicineModel");
const DiagnosisModel = require("../models/DiagnosisModel");
const Doctor = require("../models/DoctorModel");

const { createToken } = require("../Utils/adminAuth");
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const contractServiceURL = process.env.CONTRACT_SERVICE_URL;
const contractServiceAPIKey = process.env.CONTRACT_SERVICE_API_KEY;
const admin_name = process.env.ADMIN_NAME;
const admin_password = process.env.ADMIN_PASSWORD;

/**
 * @async
 * @function loginAdmin
 * @description Authenticates an admin user by verifying credentials and generating a JWT token.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing login credentials.
 * @param {string} req.body.username - Admin username.
 * @param {string} req.body.password - Admin password.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response with a JWT token or an error message.
 */
const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (username !== admin_name || password !== admin_password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
        message: 'Login successful',
        token: createToken(),
    });
});

/**
 * @async
 * @function setSafeLimit
 * @description Sets a safe dosage limit for a drug by verifying its presence on the blockchain, updating if necessary, and storing the data in MongoDB.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing drug information.
 * @param {string} req.body.regulatoryAuthorityAddress - Blockchain address of the regulatory authority.
 * @param {string} req.body.drug - Name of the drug.
 * @param {number} req.body.limit - Safe dosage limit for the drug.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response indicating success or failure.
 */
const setSafeLimit = asyncHandler(async (req, res) => {
    const { drug, limit } = req.body;
    const regulatoryAuthorityAddress = process.env.REGULATORY_BODY_ADDRESS;

    // Validate required fields
    if (!regulatoryAuthorityAddress || !drug || !limit) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let shouldSetLimit = false;

        // Check if the drug already has a set limit on the blockchain
        try {
            const checkResponse = await axios.get(`${contractServiceURL}/getSafeLimit/${drug}`, {
                headers: { Authorization: contractServiceAPIKey },
            });

            // If `success` is false, it means the drug is not registered on the blockchain
            if (checkResponse.data.success === false) {
                shouldSetLimit = true;
            } else {
                return res.status(400).json({ message: "Safe limit already exists for this drug" });
            }
        } catch (axiosError) {
            // Handle the case where blockchain returns a 400 error (drug not found)
            if (axiosError.response && axiosError.response.status === 400) {
                shouldSetLimit = true;
            } else {
                console.error("Error checking safe limit:", axiosError.message);
                return res.status(500).json({ message: "Error checking safe limit on blockchain" });
            }
        }

        // If we confirmed that the drug does not have a safe limit, proceed with setting it
        if (shouldSetLimit) {
            const reqBody = { regulatoryAuthorityAddress, drug, limit };

            // Call blockchain service to set the new safe limit
            const response = await axios.post(`${contractServiceURL}/setSafeLimit`, reqBody, {
                headers: { Authorization: contractServiceAPIKey },
            });

            if (response.status === 200) {
                // Update or insert into MongoDB
                const medicineRecord = await Medicine.findOneAndUpdate(
                    { drug },
                    { limit },
                    { upsert: true, new: true }
                );
                return res.status(200).json({ message: "Safe limit set successfully", data: medicineRecord });
            }

            return res.status(500).json({ message: "Failed to update safe limit on blockchain" });
        }
    } catch (error) {
        console.error("Error in setSafeLimit:", error.message);

        if (error.response) {
            console.error("Axios error response:", error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(500).json({ message: "Cannot set safe limit" });
    }
});

/**
 * @async
 * @function getSafeLimit
 * @description Fetches the safe dosage limit for a given drug from the blockchain.
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.drug - Name of the drug to retrieve the safe limit for.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends a JSON response containing the safe limit or an error message.
 */
const getSafeLimit = asyncHandler(async (req, res) => {
    const { drug } = req.params;

    try {
        const response = await axios.get(`${contractServiceURL}/getSafeLimit/${drug}`, {
            headers: { Authorization: contractServiceAPIKey },
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Error in getSafeLimit:", error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                success: error.response.data?.message || "false",
                message: error.response.data?.message || "Failed to retrieve dosage limit",
            });
        }

        return res.status(500).json({ message: "Cannot retrieve dosage limit" });
    }
});


/**
 * @async
 * @function viewAllPrescriptions
 * @description Establishes a Server-Sent Events (SSE) connection to stream prescription updates to the client.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} - Streams real-time prescription updates to the client.
 */
const viewAllPrescriptions = asyncHandler(async (req, res) => {
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        // Fetch and send initial prescriptions to the client
        const initialPrescriptions = await prescriptionModel.find();
        res.write(`data: ${JSON.stringify(initialPrescriptions)}\n\n`);
    } catch (err) {
        console.error("Error fetching initial prescriptions:", err);
        res.write(`data: ${JSON.stringify({ error: "Error fetching from DB" })}\n\n`);
    }

    // Watch for changes in the prescriptions collection
    const changeStream = prescriptionModel.watch();

    changeStream.on("change", async () => {
        try {
            const updatedPrescriptions = await prescriptionModel.find();
            res.write(`data: ${JSON.stringify(updatedPrescriptions)}\n\n`);
        } catch (err) {
            console.error("Error fetching updated prescriptions:", err);
            res.write(`data: ${JSON.stringify({ error: "Error fetching from DB" })}\n\n`);
        }
    });

    // Handle client disconnection
    req.on("close", () => {
        console.log("Client disconnected, closing change stream.");
        changeStream.close();
    });
});


/**
 * @async
 * @function resolveFlaggedPrescription
 * @description Resolves a flagged prescription by calling the blockchain service and updating the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with success or error message.
 */
const resolveFlaggedPrescription = asyncHandler(async (req, res) => {
    const { prescriptionId, resolution } = req.body;
    const regulatoryAuthorityAddress = process.env.REGULATORY_BODY_ADDRESS;

    // Ensure regulatory authority address is configured
    if (!regulatoryAuthorityAddress) {
        return res.status(500).json({ message: "Regulatory authority address not configured in the environment" });
    }

    // Validate required fields
    if (!prescriptionId || !resolution) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const requestBody = { regulatoryAuthorityAddress, prescriptionId, resolution };

        // Call blockchain service to resolve flagged prescription
        const response = await axios.post(`${contractServiceURL}/resolveFlaggedPrescription`, requestBody, {
            headers: { Authorization: contractServiceAPIKey },
        });

        if (response.status === 200) {
            // Update the flagged status and resolution in the database
            const updatedPrescription = await PrescriptionModel.findOneAndUpdate(
                { prescriptionId },
                {
                    flagged: false, // Mark as no longer flagged
                    resolution, // Store resolution details
                },
                { new: true } // Return updated document
            );

            if (!updatedPrescription) {
                return res.status(404).json({ message: "Prescription not found" });
            }

            return res.status(200).json({ success: true, message: "Flagged prescription resolved successfully" });
        }

        return res.status(response.status).json(response.data);
    } catch (error) {
        //console.error("Error resolving flagged prescription:", error);

        // Handle errors from Axios or database operations
        const status = error.response?.status || 500;
        const message = error.response?.data || { message: "An unexpected error occurred" };

        return res.status(status).json(message);
    }
});


/**
 * @route POST /diagnosis
 * @desc Add a new diagnosis entry
 * @access Admin
 */
const addDiagnosis = asyncHandler(async (req, res) => {
    const { diagnosisId, name, symptoms = [], category, severity } = req.body;

    // Validate required fields
    if (!diagnosisId || !name || !category || !severity) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    try {
        // Check if diagnosis already exists
        const existingDiagnosis = await DiagnosisModel.findOne({ diagnosisId });
        if (existingDiagnosis) {
            return res.status(400).json({ message: "Diagnosis ID already exists" });
        }

        // Create and save new diagnosis
        const newDiagnosis = new DiagnosisModel({ diagnosisId, name, symptoms, category, severity });
        const savedDiagnosis = await newDiagnosis.save();

        res.status(201).json({ success: true, message: "Diagnosis added successfully", data: savedDiagnosis });
    } catch (error) {
        console.error("Error adding diagnosis:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @async
 * @function findDoctorByPublicKey
 * @description Finds a doctor by Ethereum public key.
 * @route GET /findDoctorByPublicKey/:ethPublicKey
 * @access Private (Admin or Authorized Users)
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.ethPublicKey - Ethereum public key of the doctor
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with the doctor record or error message
 */
const findDoctorByPublicKey = asyncHandler(async (req, res) => {
    const { ethPubKey } = req.params; // Extract public key from params

    if (!ethPubKey) {
        return res.status(400).json({ message: "Ethereum public key is required" });
    }

    try {
        const doctor = await Doctor.findOne({ ethereumWalletAddress: ethPubKey })
        .select("-password -__v -createdAt -updatedAt");;

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        return res.status(200).json({ success: true, doctor });
    } catch (error) {
        return res.status(500).json({ success: false, message: "An error occurred while searching for the doctor" });
    }
});

module.exports = { viewAllPrescriptions, resolveFlaggedPrescription, loginAdmin, setSafeLimit, getSafeLimit, addDiagnosis, findDoctorByPublicKey };
