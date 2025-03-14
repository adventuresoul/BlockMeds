const asyncHandler = require('express-async-handler');
const Web3 = require("web3");
const { ethers } = require("ethers");
const assert = require("assert");
const fs = require("fs");
require("dotenv").config();

// Validate environment variables
const BLOCKCHAIN_NETWORK = process.env.BLOCKCHAIN_NETWORK;
assert(BLOCKCHAIN_NETWORK, "BLOCKCHAIN_NETWORK is not set in the environment variables");

// Initialize Web3 instance
const initializeWeb3 = (networkUrl) => {
    try {
        const web3Instance = new Web3(networkUrl);
        console.log(`Connecting to blockchain network: ${networkUrl}`);
        
        // Verify connection
        web3Instance.eth.net.isListening()
            .then(() => console.log("Successfully connected to blockchain network"))
            .catch((error) => {
                console.error("Error connecting to blockchain network:", error);
                process.exit(1); // Exit if unable to connect
            });

        return web3Instance;
    } catch (error) {
        console.error("Web3 initialization failed:", error);
        process.exit(1);
    }
};

// Initialize Web3
const web3 = initializeWeb3(BLOCKCHAIN_NETWORK);

// Load and parse contract ABI & address
let contractABI, contractAddress;
try {
    const contractJSON = JSON.parse(fs.readFileSync("./MedicalPrescription.json", "utf8"));
    contractABI = contractJSON.abi;
    contractAddress = contractJSON.networks["5777"].address;
    assert(contractABI, "Contract ABI is missing");
    assert(contractAddress, "Contract address is missing");
} catch (error) {
    console.error("Error loading contract JSON:", error);
    process.exit(1);
}

// Initialize Contract
const contract = new web3.eth.Contract(contractABI, contractAddress);
// contract.events.PrescriptionCreated({
//     fromBlock: "latest"
// })
// .on("data", (event) => {
//     console.log("New Prescription Created:", event.returnValues);
// })
// .on("error", console.error);

//--------------CONTROLLERS-----------------//

/**
 * @async
 * @function prescriptionCount
 * @description Fetches the total count of prescriptions stored on the blockchain.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response containing the prescription count.
 */
const prescriptionCount = asyncHandler(async (req, res) => {
    const count = await contract.methods.prescriptionCount().call();
    res.status(200).json({ success: true, count });
});

/**
 * @async
 * @function createPrescription
 * @description Creates a new prescription on the blockchain.
 * @param {Object} req - Express request object containing prescription details.
 * @param {string} req.body.doctorAddress - Address of the prescribing doctor.
 * @param {string} req.body.patientId - ID of the patient.
 * @param {string} req.body.drug - Name of the prescribed drug.
 * @param {string} req.body.dosage - Dosage of the drug.
 * @param {number} req.body.quantity - Quantity of the drug prescribed.
 * @param {boolean} req.body.emergency - Indicates if it's an emergency prescription.
 * @param {string} req.body.justification - Justification for emergency prescriptions.
 * @param {string} req.body.privateKey - Private key of the doctor for signing the transaction.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response containing transaction details.
 * @throws {Error} - If the dosage exceeds the safe limit or other blockchain-related errors occur.
 */
const createPrescription = asyncHandler(async (req, res) => {
    const { doctorAddress, patientId, drug, dosage, quantity, emergency, justification, privateKey } = req.body;

    // Validate input
    if (!doctorAddress || !privateKey || !patientId || !drug || !dosage || !quantity || justification === null) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    if (emergency && !justification) {
        return res.status(400).json({ success: false, error: "Justification is required for emergency prescriptions" });
    }

    try {
        // Prepare the transaction
        const tx = contract.methods.createPrescription(patientId, drug.toLowerCase(), dosage, quantity, emergency, justification);
        const encodedABI = tx.encodeABI();

        // Estimate gas
        let gas;
        try {
            gas = await tx.estimateGas({ from: doctorAddress });
        } catch (error) {
            console.error("Gas estimation error:", error.message);
            throw error; // Let the greater catch block handle it
        }

        const txObject = { to: contractAddress, gas, data: encodedABI };

        // Sign and send the transaction
        let receipt;
        try {
            const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
            receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        } catch (error) {
            console.error("Transaction error:", error.message);
            throw error;
        }

        // Extract and decode event logs
        const event = receipt.logs.find(log => log.address.toLowerCase() === contractAddress.toLowerCase());
        if (!event) {
            throw new Error("PrescriptionCreated event not found in logs");
        }

        const iface = new ethers.utils.Interface(contract.options.jsonInterface);
        const decodedLog = iface.parseLog(event);

        // Return response
        res.status(201).json({
            success: true,
            transactionHash: receipt.transactionHash,
            prescriptionId: decodedLog.args.id.toString(),
        });

    } catch (err) {
        const errorMessage = err.message || "";
        console.error("Unhandled error in createPrescription:", errorMessage);

        if (errorMessage.includes("Dosage exceeds safe limit")) {
            return res.status(400).json({ success: false, error: "Dosage exceeds safe limit" });
        }

        if (errorMessage.includes("Safe limit for this drug is not set")) {
            return res.status(400).json({ success: false, error: "Safe limit for this drug is not set" });
        }

        if (errorMessage.includes("Dosage is safe, no emergency flagging required")) {
            return res.status(409).json({ success: false, error: "Dosage is safe, no emergency flagging required" });
        }

        res.status(500).json({ success: false, error: "Internal server error", details: errorMessage });
    }
});


/**
 * @async
 * @function viewTransaction
 * @description Fetches details of a blockchain transaction using its hash.
 * @param {Object} req - Express request object.
 * @param {string} req.params.txHash - Transaction hash to retrieve details for.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with transaction details, receipt, and block info.
 * @throws {Error} - If the transaction, receipt, or block details cannot be fetched.
 */
const viewTransaction = asyncHandler(async (req, res) => {
    let { txHash } = req.params;

    if (!txHash || typeof txHash !== "string") {
        return res.status(400).json({ success: false, error: "Transaction hash must be a valid string" });
    }

    txHash = txHash.trim(); // Remove any unwanted spaces

    try {
        // Fetch transaction
        const tx = await web3.eth.getTransaction(txHash);
        if (!tx) {
            return res.status(404).json({ success: false, error: "Transaction not found" });
        }

        // Fetch receipt
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        if (!receipt) {
            return res.status(404).json({ success: false, error: "Transaction receipt not found" });
        }

        // Fetch block details
        const block = await web3.eth.getBlock(tx.blockNumber);

        return res.status(200).json({
            success: true,
            transaction: tx,
            receipt,
            block: {
                number: block.number,
                timestamp: block.timestamp,
                miner: block.miner,
                gasUsed: block.gasUsed,
                transactionsCount: block.transactions.length,
            },
        });
    } catch (error) {
        console.error("Error fetching transaction details:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch transaction details", details: error.message });
    }
});

/**
 * @async
 * @function fulfillPrescription
 * @description Marks a prescription as fulfilled on the blockchain.
 * @param {Object} req - Express request object.
 * @param {string} req.body.prescriptionId - ID of the prescription to fulfill.
 * @param {string} req.body.pharmacistAddress - Address of the pharmacist fulfilling the prescription.
 * @param {string} req.body.privateKey - Private key of the pharmacist for signing the transaction.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the transaction hash and updated prescription details.
 * @throws {Error} - If the prescription is already fulfilled, not found, or the transaction fails.
 */
const fulfillPrescription = asyncHandler(async (req, res) => {
    try {
        const { prescriptionId, pharmacistAddress, privateKey } = req.body;

        if (!prescriptionId || !pharmacistAddress || !privateKey) {
            return res.status(400).json({ 
                success: false, 
                error: "Prescription ID, pharmacist address, and private key are required" 
            });
        }

        // Fetch prescription details
        let prescription;
        try {
            prescription = await contract.methods.prescriptions(prescriptionId).call();
        } catch (err) {
            console.error("Error fetching prescription:", err);
            return res.status(500).json({ 
                success: false, 
                error: "Failed to fetch prescription details from blockchain",
                details: err.message 
            });
        }

        if (!prescription || prescription.id === "0") {
            return res.status(404).json({ success: false, error: "Prescription not found" });
        }

        if (prescription.fulfilled) {
            return res.status(409).json({ success: false, error: "Prescription already fulfilled" });
        }

        // Prepare the transaction
        const tx = contract.methods.fulfillPrescription(prescriptionId);
        const encodedABI = tx.encodeABI();

        let gas;
        try {
            gas = await tx.estimateGas({ from: pharmacistAddress });
        } catch (err) {
            console.error("Gas estimation failed:", err);
            return res.status(400).json({ 
                success: false, 
                error: "Gas estimation failed, possible contract rejection",
                details: err.message 
            });
        }

        const txObject = {
            from: pharmacistAddress,
            to: contractAddress,
            data: encodedABI,
            gas,
        };

        // Sign and send the transaction
        let receipt;
        try {
            const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
            receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        } catch (err) {
            console.error("Transaction failed:", err);
            return res.status(500).json({ 
                success: false, 
                error: "Transaction failed on blockchain",
                details: err.message 
            });
        }

        if (!receipt.status) {
            console.error("Blockchain transaction failed:", receipt);
            return res.status(500).json({ 
                success: false, 
                error: "Transaction failed on blockchain"
            });
        }

        // Fetch updated prescription data
        let updatedPrescription;
        try {
            updatedPrescription = await contract.methods.prescriptions(prescriptionId).call();
        } catch (err) {
            console.error("Error fetching updated prescription:", err);
            return res.status(500).json({ 
                success: false, 
                error: "Failed to fetch updated prescription details",
                details: err.message 
            });
        }

        res.status(200).json({
            success: true,
            message: "Prescription fulfilled successfully",
            transactionHash: receipt.transactionHash,
            prescriptionId,
            blockNumber: receipt.blockNumber,
            fulfilledBy: updatedPrescription.fulfilledBy,
            fulfilledAt: updatedPrescription.fulfilledAt,
        });

    } catch (err) {
        console.error("Unhandled error in fulfillPrescription:", err);
        res.status(500).json({ 
            success: false, 
            error: "An unexpected error occurred",
            details: err.message 
        });
    }
});



/**
 * @async
 * @function viewPrescription
 * @description Retrieves the details of a prescription from the blockchain.
 * @param {Object} req - Express request object.
 * @param {string} req.params.prescriptionId - ID of the prescription to retrieve.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the prescription details.
 * @throws {Error} - If the prescription is not found or retrieval fails.
 */
const viewPrescription = asyncHandler(async (req, res) => {
    const { prescriptionId } = req.params;

    if (!prescriptionId) {
        return res.status(400).json({ success: false, error: "Prescription ID is required" });
    }

    const prescription = await contract.methods.viewPrescription(prescriptionId.toString()).call();

    if (!prescription || prescription["0"] === "0") { 
        // Assuming ID "0" means the prescription doesn't exist
        return res.status(404).json({ success: false, error: "Prescription not found" });
    }

    res.status(200).json({
        success: true,
        prescription: {
            id: prescription["0"],
            doctor: prescription["1"],
            patientId: prescription["2"],
            drug: prescription["3"],
            dosage: prescription["4"],
            quantity: prescription["5"],
            justification: prescription["6"],
            fulfilled: prescription["7"],
            emergency: prescription["8"],
            flagged: prescription["9"],
        },
    });
});


/**
 * @async
 * @function setSafeLimit
 * @description Sets the safe limit for a specific drug in the blockchain.
 * @param {Object} req - Express request object.
 * @param {string} req.body.regulatoryAuthorityAddress - Address of the regulatory authority initiating the transaction.
 * @param {string} req.body.drug - Name or identifier of the drug.
 * @param {number|string} req.body.limit - Safe limit value to be set.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with transaction details.
 * @throws {Error} - If required fields are missing or the transaction fails.
 */
const setSafeLimit = asyncHandler(async (req, res) => {
    const { regulatoryAuthorityAddress, drug, limit } = req.body;

    if (!regulatoryAuthorityAddress || !drug || !limit) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const tx = contract.methods.setSafeLimit(drug.toLowerCase(), limit);
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
        message: `Safe limit for ${drug} set to ${limit}`,
        transactionHash: receipt.transactionHash,
        drug,
        limit,
    });
});


/**
 * @async
 * @function getRegulatoryAuthority
 * @description Fetches the address of the regulatory authority from the blockchain.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response containing the regulatory authority's address.
 * @throws {Error} - If the request fails.
 */
const getRegulatoryAuthority = asyncHandler(async (req, res) => {
    const regulatoryAuthority = await contract.methods.regulatoryAuthority().call();
    res.status(200).json({ success: true, regulatoryAuthority });
});


/**
 * @async
 * @function getSafeLimit
 * @description Retrieves the safe limit for a specified drug from the blockchain.
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.drug - The name or identifier of the drug.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response containing the safe limit for the drug.
 * @throws {Error} - If the request fails or the drug parameter is missing.
 */
const getSafeLimit = asyncHandler(async (req, res) => {
    const { drug } = req.params;

    if (!drug) {
        return res.status(400).json({ success: false, error: "Drug is required" });
    }

    try {
        const limit = await contract.methods.getSafeLimit(drug.toLowerCase()).call();
        res.status(200).json({ success: true, drug, limit });

    } catch (err) {
        const errorMessage = err.message || "";

        if (errorMessage.includes("Safe limit for drug not set")) {
            return res.status(400).json({ success: false, error: "Safe limit for this drug is not set" });
        }

        res.status(500).json({ success: false, error: "Internal server error" });
    }
});


/**
 * @async
 * @function resolveFlaggedPrescription
 * @description Resolves a flagged prescription by updating its status on the blockchain.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.regulatoryAuthorityAddress - The address of the regulatory authority authorizing the resolution.
 * @param {string} req.body.prescriptionId - The ID of the prescription being resolved.
 * @param {string} req.body.resolution - The resolution indicating approval or rejection.
 * @param {Object} res - Express response object.
 * @returns {void} - Sends a JSON response with the transaction hash and resolution details.
 * @throws {Error} - If the request fails due to missing fields or blockchain transaction errors.
 */
const resolveFlaggedPrescription = asyncHandler(async (req, res) => {
    const { regulatoryAuthorityAddress, prescriptionId, resolution } = req.body;

    if (!regulatoryAuthorityAddress || !prescriptionId || resolution === undefined) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
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
            transactionHash: receipt.transactionHash,
            prescriptionId,
            resolution,
        });
    } catch (error) {
        if (error.message.includes("Prescription is not flagged")) {
            return res.status(409).json({ success: false, error: "Prescription is not flagged" });
        }

        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// export all the controllers
module.exports = {
    prescriptionCount,
    createPrescription,
    fulfillPrescription,
    viewPrescription,
    setSafeLimit,
    getRegulatoryAuthority,
    getSafeLimit,
    resolveFlaggedPrescription,
    viewTransaction
};
