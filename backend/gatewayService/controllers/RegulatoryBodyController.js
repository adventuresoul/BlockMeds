const asyncHandler = require('express-async-handler');
const prescriptionModel = require('../models/prescriptionModel');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const contractServiceURL = process.env.CONTRACT_SERVICE_URL;
const contractServiceAPIKey = process.env.CONTRACT_SERVICE_API_KEY;


// SSE route to send updates to the client
const viewAllPrescriptions = asyncHandler(async (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial data to the client
    const initialPrescriptions = await prescriptionModel.find();
    res.write(`data: ${JSON.stringify(initialPrescriptions)}\n\n`);

    // Watch for changes in the prescriptions collection and send updates
    const changeStream = prescriptionModel.watch();

    changeStream.on('change', async () => {
        const updatedPrescriptions = await prescriptionModel.find();
        res.write(`data: ${JSON.stringify(updatedPrescriptions)}\n\n`);
    });

    // Handle client disconnection
    req.on('close', () => {
        console.log('Client disconnected, stopping change stream');
        changeStream.close();
    });
});

// resolve flagged
const resolveFlaggedPrescription = asyncHandler(async (req, res) => {
    const { prescriptionId, resolution } = req.body;

    // Add regulatory authority address to the request body
    const regulatoryAuthorityAddress = process.env.REGULATORY_BODY_ADDRESS;
    if (!regulatoryAuthorityAddress) {
        return res.status(500).json({ message: "Regulatory authority address not configured in the environment" });
    }

    // Validate required fields
    if (!prescriptionId || !resolution) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Include regulatory authority address in the request body
        const requestBody = { ...req.body, regulatoryAuthorityAddress };

        // Call external service to resolve flagged prescription
        const response = await axios.post(`${contractServiceURL}/resolveFlaggedPrescription`, requestBody, {
            headers: { 'Authorization': contractServiceAPIKey },
        });

        if (response.status === 200) {
            // Update the flagged status and resolution in the database
            const updatedPrescription = await prescriptionModel.findOneAndUpdate(
                { prescriptionId },
                {
                    flagged: false, // Mark the prescription as no longer flagged
                    resolution, // Store the resolution for future reference
                },
                { new: true } // Return the updated document
            );

            if (!updatedPrescription) {
                return res.status(404).json({ message: "Prescription not found" });
            }

            // Respond with success message
            return res.status(200).json({ message: "Flagged prescription resolved successfully" });
        } else {
            // Handle non-200 status from the external service
            return res.status(response.status).json(response.data);
        }
    } catch (error) {
        // Handle errors from the axios call and database operations
        const status = error.response?.status || 500;
        const message = error.response?.data || { message: "An unexpected error occurred" };
        console.log(error)
        return res.status(status).json(message);
    }
});



module.exports = { viewAllPrescriptions, resolveFlaggedPrescription };
