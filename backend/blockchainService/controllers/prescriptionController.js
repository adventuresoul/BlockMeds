const asyncHandler = require('express-async-handler');
const Web3 = require("web3");
const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;
if (!BLOCKCHAIN_NETWORK) {
    throw new Error('BLOCKCHAIN_NETWORK is not set in the environment variables');
}

const web3 = new Web3(BLOCKCHAIN_NETWORK);

web3.eth.net.isListening()
    .then(() => console.log('Connected to blockchain network'))
    .catch(e => console.error('Error connecting to blockchain network:', e));

// Contract ABI and address
const contractJSON = JSON.parse(fs.readFileSync("./MedicalPrescription.json", "utf8"));
const contractABI = contractJSON.abi;
const contractAddress = contractJSON.networks["5777"].address;

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Get prescription count
const prescriptionCount = asyncHandler(async (req, res) => {
    try {
        const count = await contract.methods.prescriptionCount().call();
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching prescription count:", error);
        res.status(500).json({ error: "Failed to fetch prescription count" });
    }
});

// Create a new prescription
const createPrescription = asyncHandler(async (req, res) => {
    const { doctorAddress, patientId, drug, dosage, quantity, emergency, justification, privateKey } = req.body;

    // Validate input
    if (!doctorAddress || !privateKey || !patientId || !drug || !dosage || !quantity || justification === null) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Prepare the transaction
        const tx = contract.methods.createPrescription(patientId, drug, dosage, quantity, emergency, justification);
        const encodedABI = tx.encodeABI();

        let gas;
        try {
            gas = await tx.estimateGas({ from: doctorAddress });
        } catch (err) {
            if (err.message.includes("Returned error: VM Exception while processing transaction: revert Dosage exceeds safe limit.")) {
                return res.status(400).json({ error: "Failed to create prescription", "details": "Dosage exceeds safe limit" });
            }
            throw err;
        }

        // check for emergency flag and justification
        if (emergency && justification === "") {
            return res.status(400).json({ success: false, error: "Justification is required for emergency prescriptions" });
        }
        const txObject = {
            to: contractAddress,
            gas,
            data: encodedABI,
        };

        // Sign the transaction with the doctor's private key
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);


        // Find the PrescriptionCreated event in the logs
        const event = receipt.logs.find(log => log.address.toLowerCase() === contractAddress.toLowerCase());
        if (!event) {
            throw new Error("PrescriptionCreated event not found in logs");
        }

        // Decode the event log using ethers.js
        const iface = new ethers.utils.Interface(contract.options.jsonInterface);
        const decodedLog = iface.parseLog(event);

        //console.log(decodedLog)
        // Return the response
        res.status(200).json({
            success: true,
            transactionHash: receipt.transactionHash,
            prescriptionId: decodedLog.args.id.toString(),
        });
    } catch (error) {
        console.error("Error creating prescription:", error);
        res.status(500).json({ error: "Failed to create prescription", details: error.message });
    }
});


// Fulfill a prescription
const fulfillPrescription = asyncHandler(async (req, res) => {
    const { prescriptionId, pharmacistAddress, privateKey } = req.body;

    if (!prescriptionId || !pharmacistAddress) {
        return res.status(400).json({ error: "Prescription ID and pharmacist address are required" });
    }

    try {
        const prescription = await contract.methods.prescriptions(prescriptionId).call();
        if (prescription.fulfilled) {
            return res.status(409).json({ error: "Prescription already fulfilled" });
        }

        const tx = contract.methods.fulfillPrescription(prescriptionId);
        const encodedABI = tx.encodeABI();
        const gas = await tx.estimateGas({ from: pharmacistAddress });

        const txObject = {
            from: pharmacistAddress,
            to: contractAddress,
            data: encodedABI,
            gas,
        };

        // Sign the transaction with the pharmacist's private key
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

        // Send the signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);


        res.status(200).json({
            success: true,
            transactionHash: receipt.transactionHash,
            prescriptionId,
        });
    } catch (error) {
        console.error("Error fulfilling prescription:", error);
        res.status(500).json({ error: "Failed to fulfill prescription" });
    }
});

// View prescription details
const viewPrescription = asyncHandler(async (req, res) => {
    const { prescriptionId } = req.params;

    try {
        if (!prescriptionId) {
            return res.status(400).json({ error: "Prescription ID is required" });
        }

        const prescription = await contract.methods.viewPrescription(prescriptionId.toString()).call();
        
        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found" });
        }
        //console.log(prescription);
        res.status(200).json({
            id: prescription['0'],
            doctor: prescription['1'],
            patientId: prescription['2'],
            drug: prescription['3'],
            dosage: prescription['4'],
            quantity: prescription['5'],
            justification: prescription['6'],
            fulfilled: prescription['7'],
            emergency: prescription['8'],
            flagged: prescription['9'],
        });
    } catch (error) {
        console.error("Error fetching prescription details:", error);
        res.status(500).json({ error: "Failed to fetch prescription details" });
    }
});

// Set safe limit for a drug
const setSafeLimit = asyncHandler(async (req, res) => {
    const { regulatoryAuthorityAddress, drug, limit } = req.body;

    if (!regulatoryAuthorityAddress || !drug || !limit) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const tx = contract.methods.setSafeLimit(drug, limit);
        const encodedABI = tx.encodeABI();
        const gas = await tx.estimateGas({ from: regulatoryAuthorityAddress });

        const txObject = {
            from: regulatoryAuthorityAddress,
            to: contractAddress,
            data: encodedABI,
            gas,
        };

        const receipt = await web3.eth.sendTransaction(txObject);

        res.status(200).json({
            success: true,
            transactionHash: receipt.transactionHash,
            drug,
            limit,
        });
    } catch (error) {
        console.error("Error setting safe limit:", error);
        res.status(500).json({ error: "Failed to set safe limit" });
    }
});

// Get the regulatory authority
const getRegulatoryAuthority = asyncHandler(async (req, res) => {
    try {
        const regulatoryAuthority = await contract.methods.regulatoryAuthority().call();
        res.status(200).json({ regulatoryAuthority });
    } catch (error) {
        console.error("Error fetching regulatory authority:", error);
        res.status(500).json({ error: "Failed to fetch regulatory authority" });
    }
});

// Get safe limit for a drug
const getSafeLimit = asyncHandler(async (req, res) => {
    const { drug } = req.params;

    if (!drug) {
        return res.status(400).json({ error: "Drug is required" });
    }

    try {
        const limit = await contract.methods.getSafeLimit(drug).call();
        res.status(200).json({ drug, limit });
    } catch (error) {
        console.error("Error fetching safe limit:", error);
        res.status(500).json({ error: "Failed to fetch safe limit" });
    }
});

// Resolve flagged prescription
const resolveFlaggedPrescription = asyncHandler(async (req, res) => {
    const { regulatoryAuthorityAddress, prescriptionId, resolution } = req.body;

    if (!regulatoryAuthorityAddress || !prescriptionId || !resolution) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const tx = contract.methods.resolveFlaggedPrescription(prescriptionId, resolution);
        const encodedABI = tx.encodeABI();
        const gas = await tx.estimateGas({ from: regulatoryAuthorityAddress });

        const txObject = {
            from: regulatoryAuthorityAddress,
            to: contractAddress,
            data: encodedABI,
            gas,
        };

        const receipt = await web3.eth.sendTransaction(txObject);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error("Error resolving flagged prescription:", error);
        res.status(500).json({ error: "Failed to resolve flagged prescription" });
    }
});

module.exports = {
    prescriptionCount,
    createPrescription,
    fulfillPrescription,
    viewPrescription,
    setSafeLimit,
    getRegulatoryAuthority,
    getSafeLimit,
    resolveFlaggedPrescription,
};
