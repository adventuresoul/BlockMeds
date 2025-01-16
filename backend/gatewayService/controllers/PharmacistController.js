// PharmacistControllers.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const pharmacistModel = require("../models/PharmacistModel");
const PrescriptionModel = require("../models/prescriptionModel");
const patientModel = require("../models/PatientModel");
require('dotenv').config(); // Load environment variables

// get URL for authentication service
const authServiceURL = process.env.AUTH_SERVICE_URL;
// get URL for contract service
const contractServiceURL = process.env.CONTRACT_SERVICE_URL;
// get API key for contract service 
const contractServiceAPIKey = process.env.CONTRACT_SERVICE_API_KEY;

// ######################## Endpoints ######################## 

const pharmacistTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Pharmacist Test Route Working!' });
});

// view Pharmacist route
const viewPharmacist = asyncHandler(async (req, res) => {
    if (req.user.roleId !== 2) {
        res.status(403).json("Unauthorized access");
    }

    // get the ID of pharmacist from the token
    const pharmacistId = req.user.userId;
    
    // find the pharmacist with the given ID
    try {
        const pharmacist = await pharmacistModel.findById(pharmacistId);
        res.status(200).json(pharmacist);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// view a prescription route
const viewPrescription = asyncHandler(async (req, res) => {
    if (req.user.roleId !== 2) {
        res.status(403).json("Unauthorized access");
    }
    else {
        const { prescriptionId } = req.params;
        // check if required fields are provided
        if (!prescriptionId) {
            return res.status(400).json({ message: 'Please provide prescriptionId' });
        }
        else {
            try {
                const response = await axios.get(`${contractServiceURL}/viewPrescription/${prescriptionId}`, {
                    headers: { 'Authorization': contractServiceAPIKey }
                });
                res.status(response.status).json(response.data);
            }
            catch (error) {
                res.status(error.response.status).json(error.response.data);        
            }
        }
    }
});

// fulfill prescription route
// fulfill prescription route
const fulfillPrescription = asyncHandler(async (req, res) => {
    if (req.user.roleId !== 2) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const { prescriptionId, pharmacistAddress, privateKey } = req.body;

    // Check if required fields are provided
    if (!prescriptionId || !pharmacistAddress || !privateKey) {
        return res.status(400).json({ message: 'Please provide prescriptionId, pharmacistAddress, and privateKey' });
    }

    try {
        // Call external service to fulfill the prescription
        const response = await axios.post(`${contractServiceURL}/fulfillPrescription`, req.body, {
            headers: { 'Authorization': contractServiceAPIKey },
        });

        if (response.status !== 200) {
            return res.status(response.status).json(response.data);
        }

        // Update MongoDB for prescription
        const updatedPrescription = await PrescriptionModel.findOneAndUpdate(
            { prescriptionId },
            {
                fulfilled: true,
                prescriptionFulfillmentTxHash: response.data.transactionHash,
            },
            { new: true } // Return the updated document
        );

        if (!updatedPrescription) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        // Update the patient's prescription history
        const patientId = updatedPrescription.patientId;
        const updatedPatient = await patientModel.findOneAndUpdate(
            { uniqueId: patientId },
            { fulfilled: true }, // Adjust this field based on your schema
            { new: true } // Return the updated document
        );
        
        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Respond with a success message only
        return res.status(200).json({ message: "Prescription fulfilled successfully" });
    } catch (error) {
        // General error handling
        let status = 500;
        let message = { message: "An unexpected error occurred" };

        if (error.response) {
            // If the error is from an axios call
            status = error.response.status;
            message = error.response.data;
        }

        return res.status(status).json(message);
    }
});

module.exports = { pharmacistTestRoute, fulfillPrescription, viewPrescription, viewPharmacist };  