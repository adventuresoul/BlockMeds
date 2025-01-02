// DoctorControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

// get URL for authentication service
const authServiceURL = process.env.AUTH_SERVICE_URL;

// ######################## Endpoints ######################## 
// simple test route
const doctorTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Doctor Test Route Working!' });
});

// sign up
const registerDoctor = asyncHandler(async (req, res) => {
    try {
        //console.log(req.body);
        const response = await axios.post(`${authServiceURL}/register/doctor`, req.body);
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

// login route
const loginDoctor = asyncHandler(async (req, res) => {
    try {
        req.body.id = 1;
        //console.log(req.body);
        const response = await axios.post(`${authServiceURL}/login`, req.body);
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

// prescription route
module.exports = { doctorTestRoute, registerDoctor, loginDoctor };