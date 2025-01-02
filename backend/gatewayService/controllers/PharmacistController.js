// PharmacistControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

// get URL for authentication service
const authServiceURL = process.env.AUTH_SERVICE_URL;

// ######################## Endpoints ######################## 

const pharmacistTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Pharmacist Test Route Working!' });
});

// sign up
const registerPharmacist = asyncHandler(async (req, res) => {
    try {
        //console.log(req.body);
        const response = await axios.post(`${authServiceURL}/register/pharmacist`, req.body);
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

// login route
const loginPharmacist = asyncHandler(async (req, res) => {
    try {
        req.body.id = 2;
        //console.log(req.body);
        const response = await axios.post(`${authServiceURL}/login`, req.body);
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});

module.exports = { pharmacistTestRoute, registerPharmacist, loginPharmacist };  