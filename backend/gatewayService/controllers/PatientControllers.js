// PatientControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

// get URL for authentication service
const authServiceURL = process.env.AUTH_SERVICE_URL;

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
        //console.log(req.body);
        const response = await axios.post(`${authServiceURL}/register/patient`, req.body);
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

// login route
const loginPatient = asyncHandler(async (req, res) => {
    try {
        req.body.id = 0;
        //console.log(req.body);
        const response = await axios.post(`${authServiceURL}/login`, req.body);
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

module.exports = { patientTestRoute, registerPatient, loginPatient };






















