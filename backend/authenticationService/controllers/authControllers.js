const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// Importing Models
const Patient = require("../models/PatientModel");
const Doctor = require("../models/DoctorModel");
const Pharmacist = require("../models/PharmacistModel");

// Importing generate token method
const { generateToken } = require("../Utils/tokenGenerator");

// ######################## Endpoints ######################## 
// Simple test route
const authTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'auth Test Route Working!' });
});

// Patient registration route
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

        console.log(firstName, lastName, dateOfBirth, gender, contactNumber, email, password,  bloodType);
        
        // Checking for required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumber || !bloodType || !email || !password) {
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

// Doctor registration route
const registerDoctor = asyncHandler(async (req, res) => {
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
            ethereumPublicKey,
            specialization = [],
            experianceYears,
            medicalLicenseId,
            medicalLicenseIssuer,
            medicalLicenseCertificateUrl,
            previousHospitals = [],
            currentHospitalCode,
            consultationFee
        } = req.body;

        // Checking for required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumber || !email || !password || !specialization || !experianceYears || !medicalLicenseId || !medicalLicenseIssuer || !medicalLicenseCertificateUrl || !currentHospitalCode || !consultationFee) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validating gender
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ error: "Invalid gender. Must be 'male' or 'female'." });
        }

        // Validating Ethereum public key (if provided)
        if (ethereumPublicKey && !/^(0x)?[0-9a-fA-F]{40}$/.test(ethereumPublicKey)) {
            return res.status(400).json({ error: "Invalid Ethereum public key." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new Doctor instance
        const newDoctor = new Doctor({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            contactNumber,
            email: email ? email.toLowerCase() : undefined,
            password: hashedPassword,
            profileUrl,
            ethereumPublicKey,
            specialization,
            experianceYears,
            medicalLicenseId,
            medicalLicenseIssuer,
            medicalLicenseCertificateUrl,
            previousHospitals,
            currentHospitalCode,
            consultationFee
        });

        // Save the doctor to the database
        const savedDoctor = await newDoctor.save();

        // Respond with the saved doctor data (excluding sensitive fields)
        res.status(201).json({
            message: "Doctor registered successfully",
            doctor: {
                id: savedDoctor._id,
                firstName: savedDoctor.firstName,
                lastName: savedDoctor.lastName,
                email: savedDoctor.email
            }
        });
    } catch (error) {
        console.error("Error during doctor registration:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Registration failed. Please try again later." });
    }
});

// Pharmacist registration route
const registerPharmacist = asyncHandler(async (req, res) => {
    try {
        // Destructure request body
        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            contactNumer,
            email,
            password,
            profileUrl,
            ethereumPublicKey,
            pharmacyLicenseId,
            currentPharmacyCode,
        } = req.body;

        console.log(firstName, lastName, dateOfBirth, gender, contactNumer, email, password);

        // Checking for required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumer || !email || !password || !pharmacyLicenseId || !currentPharmacyCode) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validating gender
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ error: "Invalid gender. Must be 'male' or 'female'." });
        }

        // Validating Ethereum public key (if provided)
        if (ethereumPublicKey && !/^(0x)?[0-9a-fA-F]{40}$/.test(ethereumPublicKey)) {
            return res.status(400).json({ error: "Invalid Ethereum public key." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new Pharmacist instance
        const newPharmacist = new Pharmacist({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            contactNumer,
            email: email ? email.toLowerCase() : undefined,
            password: hashedPassword,
            profileUrl,
            ethereumPublicKey,
            pharmacyLicenseId,
            currentPharmacyCode,
        });

        // Save the pharmacist to the database
        const savedPharmacist = await newPharmacist.save();

        // Respond with the saved pharmacist data (excluding sensitive fields)
        res.status(201).json({
            message: "Pharmacist registered successfully",
            pharmacist: {
                id: savedPharmacist._id,
                firstName: savedPharmacist.firstName,
                lastName: savedPharmacist.lastName,
                email: savedPharmacist.email,
            },
        });
    } catch (error) {
        console.error("Error during registration:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        //console.log(error);
        res.status(500).json({ error: "Registration failed. Please try again later." });
    }
});

// Login route
const loginRoute = asyncHandler(async (req, res) => {
    // Get user_id, email, and password from req.body
    const { id, email, password } = req.body;

    //console.log(id, email, password);
    if (!email || !password || id == null) {
        return res.status(400).send('Missing required fields');
    }

    try {
        let user = null;

        // Use switch-case for checking user class
        switch (id) {
            case 0:
                user = await Patient.findOne({ email: email });
                break;
            case 1:
                user = await Doctor.findOne({ email: email });
                break;
            case 2:
                user = await Pharmacist.findOne({ email: email });
                break;
            default:
                return res.status(400).send('Invalid user class');
        }

        // Check if user exists
        if (!user) {
            return res.status(401).send('Invalid credentials');
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        // Generate token
        const token = generateToken(user, id);
        res.status(200).json({ token });

    } catch (error) {
        res.status(500).send('Error logging in: ' + error.message);
    }
});

module.exports = { authTestRoute, loginRoute, registerPatient, registerDoctor, registerPharmacist };    
