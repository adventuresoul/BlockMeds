const express = require("express");
const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();

// Initialize app and web3
const app = express();
app.use(express.json());

const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;
const web3 = new Web3(BLOCKCHAIN_NETWORK); // Local Ganache

// Contract ABI and address
const contractJSON = JSON.parse(fs.readFileSync("./MedicalPrescription.json", "utf8"));
const contractABI = contractJSON.abi;
const contractAddress = contractJSON.networks["5777"].address;

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Route to get prescription count
app.get("/prescriptionCount", async (req, res) => {
    try {
        //console.log("Fetching prescription count");
        const count = await contract.methods.prescriptionCount().call();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch prescription count" });
    }
});

// Route to create new prescription
app.post('/createPrescription', async (req, res) => {
    const { doctorAddress, patientId, drug, dosage, direction, comments } = req.body;

    try {
        // Create transaction data
        const tx = contract.methods.createPrescription(patientId, drug, dosage, direction, comments);
        const encodedABI = tx.encodeABI();

        // Get gas estimate
        const gas = await tx.estimateGas({ from: doctorAddress });

        // Prepare the transaction
        const txObject = {
            from: doctorAddress,
            to: contractAddress,
            data: encodedABI,
            gas,
        };

        // Send the transaction using the Ethereum client (Ganache)
        const receipt = await web3.eth.sendTransaction(txObject);

        // Retrieve the prescription ID from the logs
        const event = receipt.logs.find(log => log.address.toLowerCase() === contractAddress.toLowerCase());
        if (!event) {
            throw new Error("Event not found in logs");
        }

        // Event ABI (Replace with your actual event name and inputs)
        const eventABI = contract.options.jsonInterface.find(item => item.name === "PrescriptionCreated"); 

        // Decode the log using the event ABI
        const decodedLog = web3.eth.abi.decodeLog(eventABI.inputs, event.data, event.topics.slice(1));

        // Extract the prescriptionId from the decoded log
        const prescriptionId = decodedLog.id.toString(); 
        //console.log(`Prescription ID: ${prescriptionId}`);

        // Respond with transactionHash and prescriptionId
        res.status(200).json({
            success: true,
            transactionHash: receipt.transactionHash,
            prescriptionId,
            patientId,
            drug,
        });
    } catch (error) {
        console.error("Error creating prescription:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Endpoint to fulfill a prescription
app.post("/fulfillPrescription", async (req, res) => {
    try {
        const { prescriptionId, pharmacistAddress } = req.body;

        if (!prescriptionId || !pharmacistAddress) {
            return res.status(400).json({ error: "Prescription ID and pharmacist address are required" });
        }

        // Query the contract to check if the prescription is already fulfilled
        const prescription = await contract.methods.prescriptions(prescriptionId).call();
        if (prescription.fulfilled) {
            return res.status(409).json({ error: "This prescription is already fulfilled." });
        }

        // Create transaction data
        const tx = contract.methods.fulfillPrescription(prescriptionId);
        const encodedABI = tx.encodeABI();

        // Get gas estimate
        let gas;
        try {
            gas = await tx.estimateGas({ from: pharmacistAddress });
            console.log("Gas estimate:", gas);
        } catch (error) {
            console.error("Gas estimation failed:", error);
            return res.status(500).json({ success: false, message: "Gas estimation failed" });
        }

        // Prepare the transaction
        const txObject = {
            from: pharmacistAddress,
            to: contractAddress,
            data: encodedABI,
            gas,
        };

        // Send the transaction using the Ethereum client (Ganache)
        let receipt;
        try {
            receipt = await web3.eth.sendTransaction(txObject);
            console.log("Transaction receipt:", receipt);
        } catch (error) {
            console.error("Transaction error:", error);
            return res.status(500).json({ success: false, message: "Failed to send transaction" });
        }

        // Respond with transactionHash and prescriptionId
        return res.status(200).json({
            success: true,
            transactionHash: receipt.transactionHash,
            prescriptionId,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ success: false, message: "Failed to fulfill prescription" });
    }
});

// Route to view a prescription
app.get("/viewPrescription/:prescriptionId", async (req, res) => {
    try {
        const { prescriptionId } = req.params;

        // Ensure the prescriptionId is a valid BigNumber
        const prescriptionIdBN = web3.utils.toBN(prescriptionId);  // Convert the string to a BigNumber if it's a valid format

        // Fetch prescription details
        const prescription = await contract.methods.viewPrescription(prescriptionIdBN).call();

        if (!prescription || !prescription[0]) {
            return res.status(404).json({ error: "Prescription not found" });
        }

        // Return prescription details
        res.json({
            id: prescription[0].toString(),
            doctor: prescription[1],
            patientId: prescription[2],
            drug: prescription[3],
            dosage: prescription[4],
            direction: prescription[5],
            comments: prescription[6],
            fulfilled: prescription[7],
        });
    } catch (error) {
        console.error("Error fetching prescription:", error);
        res.status(500).json({ error: "Failed to fetch prescription details" });
    }
});


// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
