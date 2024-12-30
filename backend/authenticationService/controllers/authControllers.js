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

// Login route
const loginRoute = asyncHandler(async (req, res) => {
    // Get user_id, email, and password from req.body
    const { id, email, password } = req.body;

    console.log(id, email, password);
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

module.exports = { authTestRoute, loginRoute };
