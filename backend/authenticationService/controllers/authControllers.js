const asyncHandler = require("express-async-handler");  // can remove try-catch blocks
const bcrypt = require("bcrypt");

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

/**
 * @async
 * @function registerPatient
 * @description Handles patient registration by validating input, hashing the password, generating a unique ID, 
 *              and storing the patient details in the database.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body containing patient details.
 * @param {string} req.body.firstName - Patient's first name.
 * @param {string} req.body.lastName - Patient's last name.
 * @param {string} req.body.dateOfBirth - Patient's date of birth.
 * @param {string} req.body.gender - Patient's gender (must be "male" or "female").
 * @param {string} req.body.contactNumber - Patient's contact number.
 * @param {string} req.body.email - Patient's email address.
 * @param {string} req.body.password - Patient's password (hashed before storing).
 * @param {string} [req.body.profileUrl] - Optional profile image URL.
 * @param {Array} [req.body.prescriptionHistory=[]] - Optional list of previous prescriptions.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the registered patient's details or an error message.
 * @throws {Error} - Handles validation errors and server errors.
 */
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
            prescriptionHistory = []
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumber || !email || !password) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        // Validate gender
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ success: false, error: "Invalid gender. Must be 'male' or 'female'." });
        }

        // REDIS BLOOM FILTER for contact number checking
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate a unique ID based on contact number
        const uniqueId = (contactNumber + firstName.length) % 100000;

        // Create a new Patient instance
        const newPatient = new Patient({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            dateOfBirth: dateOfBirth,
            gender: gender.toLowerCase(),
            contactNumber: contactNumber,
            uniqueId: uniqueId,
            email: email.toLowerCase(),
            password: hashedPassword,
            profileUrl: profileUrl,
            prescriptionHistory: prescriptionHistory,
        });

        // Save to MongoDB
        const savedPatient = await newPatient.save();

        // Respond with success
        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            patient: {
                uniqueid: savedPatient.uniqueId,
                firstName: savedPatient.firstName,
                lastName: savedPatient.lastName,
                email: savedPatient.email,
            },
        });

    } catch (error) {
        console.error("Error during registration:", error);

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, error: error.message });
        }

        // General server error
        res.status(500).json({ success: false, error: "Registration failed. Please try again later." });
    }
});


/**
 * @async
 * @function registerDoctor
 * @description Handles doctor registration by validating input, hashing the password, and storing the doctor's details in the database.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body containing doctor details.
 * @param {string} req.body.firstName - Doctor's first name.
 * @param {string} req.body.lastName - Doctor's last name.
 * @param {string} req.body.dateOfBirth - Doctor's date of birth.
 * @param {string} req.body.gender - Doctor's gender (must be "male" or "female").
 * @param {string} req.body.contactNumber - Doctor's contact number.
 * @param {string} req.body.email - Doctor's email address.
 * @param {string} req.body.password - Doctor's password (hashed before storing).
 * @param {string} req.body.ethereumWalletAddress - Doctor's Ethereum wallet address.
 * @param {string} [req.body.profileUrl] - Optional profile image URL.
 * @param {string} req.body.specialization - Doctor's medical specialization.
 * @param {string} req.body.medicalLicenseId - Doctor's medical license ID.
 * @param {string} [req.body.medicalLicenseCertificateUrl] - Optional URL of the doctor's medical license certificate.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the registered doctor's details or an error message.
 * @throws {Error} - Handles validation errors and server errors.
 */
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
            ethereumWalletAddress,
            profileUrl,
            specialization,
            medicalLicenseId,
            medicalLicenseCertificateUrl,
        } = req.body;

        // Checking for required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumber || !email || !password || !ethereumWalletAddress || !specialization || !medicalLicenseId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validating gender
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ error: "Invalid gender. Must be 'male' or 'female'." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new Doctor instance
        const newDoctor = new Doctor({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            dateOfBirth: dateOfBirth,
            gender: gender,
            contactNumber: contactNumber,
            email: email.toLowerCase(),
            password: hashedPassword,
            ethereumWalletAddress: ethereumWalletAddress,
            profileUrl: profileUrl,
            specialization: specialization,
            medicalLicenseId: medicalLicenseId,
            medicalLicenseCertificateUrl: medicalLicenseCertificateUrl,
        });

        // Save the doctor to the database
        const savedDoctor = await newDoctor.save();

        // Respond with success
        res.status(201).json({
            success: true,
            message: "Doctor registered successfully",
            doctor: {
                firstName: savedDoctor.firstName,
                lastName: savedDoctor.lastName,
                email: savedDoctor.email,
            },
        });
    } catch (error) {
        console.error("Error during doctor registration:", error);

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, error: error.message });
        }

        // General server error
        res.status(500).json({ success: false, error: "Registration failed. Please try again later." });
    }
});

/**
 * @async
 * @function registerPharmacist
 * @description Handles pharmacist registration by validating input, hashing the password, and storing the pharmacist's details in the database.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body containing pharmacist details.
 * @param {string} req.body.firstName - Pharmacist's first name.
 * @param {string} req.body.lastName - Pharmacist's last name.
 * @param {string} req.body.dateOfBirth - Pharmacist's date of birth.
 * @param {string} req.body.gender - Pharmacist's gender (must be "male" or "female").
 * @param {string} req.body.contactNumber - Pharmacist's contact number.
 * @param {string} req.body.email - Pharmacist's email address.
 * @param {string} req.body.password - Pharmacist's password (hashed before storing).
 * @param {string} req.body.ethereumWalletAddress - Pharmacist's Ethereum wallet address.
 * @param {string} [req.body.profileUrl] - Optional profile image URL.
 * @param {string} req.body.pharmacyLicenseId - Pharmacist's pharmacy license ID.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the registered pharmacist's details or an error message.
 * @throws {Error} - Handles validation errors and server errors.
 */
const registerPharmacist = asyncHandler(async (req, res) => {
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
            ethereumWalletAddress,
            profileUrl,
            pharmacyLicenseId,
        } = req.body;

        //console.log(firstName, lastName, dateOfBirth, gender, contactNumber, email, password);

        // Checking for required fields
        if (!firstName || !lastName || !dateOfBirth || !gender || !contactNumber || !email || !password || !ethereumWalletAddress || !pharmacyLicenseId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validating gender
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ error: "Invalid gender. Must be 'male' or 'female'." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new Pharmacist instance
        const newPharmacist = new Pharmacist({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            dateOfBirth: dateOfBirth,
            gender: gender.toLowerCase(),
            contactNumber: contactNumber,
            email: email.toLowerCase(),
            password: hashedPassword,
            ethereumWalletAddress: ethereumWalletAddress,
            profileUrl: profileUrl,
            pharmacyLicenseId: pharmacyLicenseId,
        });

        // Save the pharmacist to the database
        const savedPharmacist = await newPharmacist.save();

        // Respond with the saved pharmacist data (excluding sensitive fields)
        return res.status(201).json({
            success: true,
            message: "Pharmacist registered successfully",
            pharmacist: {
                firstName: savedPharmacist.firstName,
                lastName: savedPharmacist.lastName,
                email: savedPharmacist.email,
            },
        });
    } catch (error) {
        console.error("Error during pharmacist registration:", error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, error: error.message });
        }
        return res.status(500).json({ success: false, error: "Registration failed. Please try again later." });
    }
});

/**
 * @async
 * @function loginRoute
 * @description Handles user login for Patients, Doctors, and Pharmacists by validating credentials and returning a JWT token.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body containing login details.
 * @param {number} req.body.id - The user type identifier (0 for Patient, 1 for Doctor, 2 for Pharmacist).
 * @param {string} req.body.email - The user's email address.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with a JWT token on successful authentication or an error message on failure.
 * @throws {Error} - Handles missing fields, invalid credentials, and server errors.
 */
const loginRoute = asyncHandler(async (req, res) => {
    const { id, email, password } = req.body;

    // Validate required fields
    if (!email || !password || id === undefined) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields",
        });
    }

    try {
        // User model mapping based on id
        const userTypes = {
            0: Patient,
            1: Doctor,
            2: Pharmacist,
        };

        const UserModel = userTypes[id];
        console.log(UserModel)
        // Validate user type
        if (!UserModel) {
            return res.status(400).json({
                success: false,
                error: "Invalid user type",
            });
        }

        // Find user in database
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        // Generate and send token
        const token = generateToken(user, id);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            error: "Login failed. Please try again later.",
        });
    }
});


module.exports = { authTestRoute, loginRoute, registerPatient, registerDoctor, registerPharmacist };    
