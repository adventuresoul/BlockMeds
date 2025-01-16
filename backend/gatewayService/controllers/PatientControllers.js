// PatientControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const patientModel = require('../models/PatientModel');

require('dotenv').config(); // Load environment variables

// get URL for authentication service
const authServiceURL = process.env.AUTH_SERVICE_URL;

// Importing Patient Model
const Patient = require("../models/PatientModel");
const PatientModel = require('../models/PatientModel');

// ######################## Endpoints ######################## 

// simple test route
const patientTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Patient Test Route Working!' });
});

// view specific patient
const viewPatient = asyncHandler(async (req, res) => {
    // get the ID of patient from the token
    const patientId = req.user.userId;
    console.log(patientId);

    // find the patient with the given ID
    try {
        const Patient = await PatientModel.findById(patientId);
        res.status(200).json(Patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


module.exports = { patientTestRoute, viewPatient };






















