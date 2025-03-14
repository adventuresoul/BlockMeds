// DoctorControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');

const Prescription = require("../models/PrescriptionModel");
const Patient = require("../models/PatientModel");
const Doctor = require("../models/DoctorModel");
const Diagnosis = require("../models/DiagnosisModel");
const Medicine = require("../models/MedicineModel");

require('dotenv').config(); // Load environment variables

const contractServiceURL = process.env.CONTRACT_SERVICE_URL;
const contractServiceAPIKey = process.env.CONTRACT_SERVICE_API_KEY;

// ######################## Endpoints ######################## 
/** 
 * @async
 * @function doctorTestRoute
 * @description test route for /doctor
**/ 
const doctorTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Doctor Test Route Working!' });
});

/**
 * @async
 * @function getDoctorProfile
 * @description Retrieves the profile of the authenticated doctor.
 *              Only doctors (roleId = 1) are authorized to access this data.
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user object.
 * @param {number} req.user.roleId - The role ID of the authenticated user (must be 1 for doctors).
 * @param {string} req.user.userId - The unique ID of the doctor.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the doctor's profile or an error message.
 * @throws {Error} - Returns 403 if unauthorized, 404 if profile not found, and 500 for server errors.
 */
const getDoctorProfile = asyncHandler(async (req, res) => {
    const { userId: doctorId, roleId } = req.user;

    // Authorization check: Only doctors can access their profile
    if (roleId !== 1) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    try {
        //console.log(`Fetching profile for doctorId: ${doctorId}`);

        // Find doctor by ID
        const doctor = await Doctor.findById(doctorId).select(
            "-_id -password -__v -createdAt -updatedAt"
        );

        // If doctor not found, return 404
        if (!doctor) {
            return res.status(404).json({ message: "Doctor profile not found." });
        }

        return res.status(200).json(doctor);
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
});


/**
 * @async
 * @function getDoctorPrescriptionHistory
 * @description Retrieves a doctor's prescription history.
 *              Only doctors (roleId = 1) are authorized to access this data.
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user object.
 * @param {number} req.user.roleId - The role ID of the authenticated user (must be 1 for doctors).
 * @param {string} req.user.userId - The unique ID of the doctor.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the doctor's prescription history or an error message.
 * @throws {Error} - Returns 403 if unauthorized, 404 if no prescriptions found, and 500 for server errors.
 **/
// implement pagination number of records increases per query
const getDoctorPrescriptionHistory = asyncHandler(async (req, res) => {
    const { roleId, userId: doctorId } = req.user;

    // Authorization check: Only doctors can access their prescription history
    if (roleId !== 1) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    try {
        //console.log(`Fetching prescriptions for doctorId: ${doctorId}`);

        // Find prescriptions created by the doctor
        const prescriptions = await Prescription.find({ doctorId }).sort({ time: -1 });

        // If no prescriptions found, return 404
        if (!prescriptions.length) {
            return res.status(404).json({ message: "No prescriptions found for this doctor." });
        }

        return res.status(200).json(prescriptions);
    } catch (error) {
        console.error("Error fetching prescription history:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
});


/** 
* @async
* @function getPatientProfile
* @description Retrieves a patient's profile based on their contact number.
*              Only doctors (roleId = 1) are authorized to access patient profiles.
* @param {Object} req - Express request object.
* @param {Object} req.user - Authenticated user object.
* @param {number} req.user.roleId - The role ID of the authenticated user (must be 1 for doctors).
* @param {Object} req.body - Request body.
* @param {string} req.body.contactNumber - The contact number of the patient to retrieve.
* @param {Object} res - Express response object.
* @returns {void} - Sends a JSON response with the patient's profile or an error message.
* @throws {Error} - Returns 403 if unauthorized, 400 if input is invalid, 404 if patient not found, and 500 for server errors.
**/
const getPatientProfile = asyncHandler(async (req, res) => {
    const { roleId } = req.user;
    const { contactNumber } = req.body;

    // Authorization check: Only doctors can access patient profiles
    if (roleId !== 1) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    // Validate that contactNumber is provided
    if (!contactNumber) {
        return res.status(400).json({ message: "Contact number is required" });
    }

    try {
        console.log(`Fetching patient with contact number: ${contactNumber}`);

        // Find patient by contact number
        const patient = await Patient.findOne({ contactNumber });

        // If patient not found, return a 404 response
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const sanitizedPatient = {
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            contactNumber: patient.contactNumber,
            uniqueId: patient.uniqueId,
            email: patient.email,
            profileUrl: patient.profileUrl,
            prescriptionHistory: patient.prescriptionHistory
        };
        return res.status(200).json(sanitizedPatient);

    } catch (error) {
        console.error("Error fetching patient profile:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
});

/**
 * @description Creates a prescription for a patient, stores it on the blockchain, and saves it in the database.
 * @route POST /createPrescription
 * @access Private (Doctors only)
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.roleId - Role ID of the authenticated user
 * @param {number} req.user.userId - ID of the authenticated doctor
 * @param {Object} req.body - Request payload containing prescription details
 * @param {string} req.body.doctorAddress - Ethereum address of the doctor
 * @param {string} req.body.patientId - Unique ID of the patient
 * @param {string} req.body.drug - Prescribed drug name
 * @param {string} req.body.dosage - Dosage details
 * @param {number} req.body.quantity - Quantity prescribed
 * @param {string} req.body.directions - Usage directions
 * @param {boolean} req.body.emergency - Indicates if the prescription is for an emergency
 * @param {string} [req.body.justification] - Justification for emergency prescriptions (if applicable)
 * @param {string} req.body.privateKey - Doctor's private key for blockchain transaction
 * @param {string} [req.body.diagnosisId] - Optional diagnosis ID linked to the prescription
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */
const createPrescription = asyncHandler(async (req, res) => {
    // Check if the user is a doctor
    if (req.user.roleId !== 1) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const { doctorAddress, patientId, drug, dosage, quantity, directions, emergency, justification, privateKey, diagnosisId } = req.body;

    // Validate required fields (diagnosisId should NOT be required)
    if (!doctorAddress || !patientId || !drug || !dosage || !quantity || !directions || emergency === undefined || !privateKey) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    try {
        const reqBody = { doctorAddress, patientId, drug, dosage, quantity, directions, emergency, justification, privateKey };

        // Make an API call to the contract service
        const response = await axios.post(`${contractServiceURL}/createPrescription`, reqBody, {
            headers: { Authorization: contractServiceAPIKey },
        });

        // If API call succeeds, save prescription to the database
        if (response.status === 201) {
            const prescriptionData = {
                prescriptionId: response.data.prescriptionId,
                doctorId: req.user.userId,
                doctor: doctorAddress,
                patientId,
                drug,
                dosage,
                quantity,
                directions,
                fulfilled: false,
                emergency,
                justification,
                flagged: emergency,
                time: Date.now(),
                prescriptionCreationTxHash: response.data.transactionHash,
            };

            if (diagnosisId) {
                prescriptionData.diagnosisId = diagnosisId;
            }
            
            const savedPrescription = await new Prescription(prescriptionData).save();
    

         
            // Update the user's prescription history
          
                const userProfile = await Patient.findOneAndUpdate(
                    { uniqueId: String(patientId) },
                    { $push: { prescriptionHistory: savedPrescription._id } },
                    { new: true }
                );

            if (!userProfile) {
                return res.status(404).json({ message: "User profile not found" });
            }

            return res.status(201).json({
                message: "Prescription created successfully",
                prescription: response.data,
            });
        } else {
            return res.status(response.status).json(response.data);
        }
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.data || "Blockchain transaction failed" });
        }

        return res.status(500).json({ message: "An internal server error occurred" });
    }
});



/**
 * @route   GET /findMedicines
 * @desc    Search for medicines by name as the doctor types
 * @access  Private (Requires authentication)
 */
const findMedicines = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
        // Perform a case-insensitive search using regex
        const medicines = await Medicine.find({ 
            drug: { $regex: new RegExp(q, 'i') } 
        });

        res.status(200).json(medicines);
    } catch (error) {
        console.error("Error in findMedicines:", error.message);
        res.status(500).json({ message: "An error occurred while searching for medicines" });
    }
});

/**
 * @route   GET /findDiagnosis
 * @desc    Search for diagnosis records by name as the user types
 * @access  Public
 * @param   {string} req.query.q - The search query for diagnosis name
 * @returns {Object[]} - List of matching diagnosis records
 */
const findDiagnosis = asyncHandler(async (req, res) => {
    const { q } = req.query; // Extract search query

    if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
        // Search diagnosis by name (case-insensitive, partial match)
        const diagnoses = await Diagnosis.find({
            name: { $regex: q, $options: "i" }
        }).limit(10); // Limit results for better performance

        res.status(200).json(diagnoses);
    } catch (error) {
        console.error("Error in findDiagnosis:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// prescription route
module.exports = { doctorTestRoute, createPrescription, getDoctorProfile, 
    getDoctorPrescriptionHistory, getPatientProfile, findDiagnosis, findMedicines 
};