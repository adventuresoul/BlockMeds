// DoctorControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const prescriptionModel = require("../models/prescriptionModel");
const patientModel = require("../models/PatientModel");
const doctorModel = require("../models/DoctorModel");
require('dotenv').config(); // Load environment variables

const contractServiceURL = process.env.CONTRACT_SERVICE_URL;
const contractServiceAPIKey = process.env.CONTRACT_SERVICE_API_KEY;

// ######################## Endpoints ######################## 
// simple test route
const doctorTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Doctor Test Route Working!' });
});

// get doctor's profile
const getDoctorProfile = asyncHandler(async (req, res) => {
    // get the ID of doctor from the token
    const doctorId = req.user.userId;
    //console.log(doctorId);

    // find the doctor with the given ID
    try {
        const doctor = await doctorModel.findById(doctorId);
        res.status(200).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}); 

// get doctor's prescription history
const getDoctorPrescriptionHistory = asyncHandler(async (req, res) => {
    // Check if the user is a doctor
    if (req.user.roleId !== 1) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    // get the ID of doctor from the token
    const doctorId = req.user.userId;
    //console.log(doctorId);

    // find the doctor with the given ID
    try {
        const prescriptions = await prescriptionModel.find({ doctorId: doctorId });
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// get patient's profile
const getPatientProfile = asyncHandler(async (req, res) => {
    // Check if the user is a doctor
    if (req.user.roleId !== 1) {
        return res.status(403).json({ message: "Unauthorized access" });
    }
    // get the contact of patient from req.body
    const contactNumber = req.body.contactNumber;

    // find the patient with the given ID
    try {
        const patient = await patientModel.findOne({ contactNumber: contactNumber });
        res.status(200).json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// create prescription
const createPrescription = asyncHandler(async (req, res) => {
    // Check if the user is a doctor
    if (req.user.roleId !== 1) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const { doctorAddress, patientId, drug, dosage, quantity, directions, emergency, justification, privateKey } = req.body;

    // Validate required fields
    if (!doctorAddress || !patientId || !drug || !dosage || !quantity || !directions || emergency === undefined || !privateKey) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Make an API call to the contract service
        const response = await axios.post(`${contractServiceURL}/createPrescription`, req.body, {
            headers: { 'Authorization': contractServiceAPIKey },
        });


        // If API call succeeds, save prescription to the database
        if (response.status === 200) {
            // Create and save the prescription
            const prescription = new prescriptionModel({
                prescriptionId: response.data.prescriptionId,
                doctorId: req.user.userId,
                doctor: doctorAddress,
                patientId: patientId,
                drug: drug,
                dosage: dosage,
                quantity: quantity,
                directions: directions,
                fulfilled: false,
                emergency: emergency,
                justification: justification,
                flagged: (emergency ? true : false),
                time: Date.now(),
                prescriptionCreationTxHash: response.data.transactionHash
            });

            const savedPrescription = await prescription.save();

            // Update the user's prescription history
            const userProfile = await patientModel.findOne({ uniqueId: patientId });
            if (userProfile) {
                userProfile.prescriptionHistory.push({
                    savedPrescription
                });

                await userProfile.save();
            } else {
                return res.status(404).json({ message: "User profile not found" });
            }

            // Send response
            return res.status(200).json({
                message: "Prescription created successfully",
                prescription: response.data,
            });
        } else {
            return res.status(response.status).json(response.data);
        }
    } catch (error) {
        // Handle errors from the contract service or database operations
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        console.error(error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
});

// prescription route
module.exports = { doctorTestRoute, createPrescription, getDoctorProfile, getDoctorPrescriptionHistory, getPatientProfile };