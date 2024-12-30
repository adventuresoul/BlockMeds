// PatientControllers.js
const asyncHandler = require('express-async-handler');

// Bcrypt instance for password hashing
const bcrypt = require('bcrypt');

// Importing Patient Model
const Patient = require("../models/PatientModel");


// ######################## Endpoints ######################## 

// simple test route
const patientTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Patient Test Route Working!' });
});

// sign up
const registerPatient = asyncHandler(async (req, res) => {
    try {
        // Destructure request body
        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            contactNumber,
            email,
            password,
            profileUrl,
            emergencyContactNumber,
            bloodType,
            allergies = [],
            chronicConditions = [],
            currentMedications = [],
            prescriptionHistory = [],
            medicalHistory = [],
            insuranceProvider,
            insurancePolicyNumber,
        } = req.body;

        console.log(req)
        
        // Checking for required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumber || !bloodType || email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // check in Redis bloom filter if contact number already exists or not
        

        // Validating gender
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ error: "Invalid gender. Must be 'male' or 'female'." });
        }

        // Validating blood type
        const validBloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
        if (!validBloodTypes.includes(bloodType)) {
            return res.status(400).json({ error: `Invalid blood type. Must be one of: ${validBloodTypes.join(", ")}` });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new Patient instance
        const newPatient = new Patient({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            contactNumber,
            email: email ? email.toLowerCase() : undefined,
            password: hashedPassword,
            profileUrl,
            emergencyContactNumber,
            bloodType,
            allergies,
            chronicConditions,
            currentMedications,
            prescriptionHistory,
            medicalHistory,
            insuranceProvider,
            insurancePolicyNumber,
        });

        // Save the patient to the database
        const savedPatient = await newPatient.save();

        // Respond with the saved patient data (excluding sensitive fields)
        res.status(201).json({
            message: "Patient registered successfully",
            patient: {
                id: savedPatient._id,
                firstName: savedPatient.firstName,
                lastName: savedPatient.lastName,
                email: savedPatient.email,
            },
        });
    } catch (error) {
        console.error("Error during registration:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Registration failed. Please try again later." });
    }
});



module.exports = { patientTestRoute, registerPatient };






















