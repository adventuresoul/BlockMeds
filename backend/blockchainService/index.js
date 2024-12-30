const express = require("express");
const Web3 = require("web3");
const fs = require("fs");

// Initialize app and web3
const app = express();
app.use(express.json());
const web3 = new Web3("http://localhost:7545");  // Local Ganache


// Contract ABI and address
const contractJSON = JSON.parse(fs.readFileSync("./MedicalPrescription.json", "utf8"));
const contractABI = contractJSON.abi;
const contractAddress = contractJSON.networks["5777"].address;

const contract = new web3.eth.Contract(contractABI, contractAddress);

// route to get prescription count
app.get("/prescriptionCount", async (req, res) => {
    try {
        const count = await contract.methods.prescriptionCount().call();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch prescription count" });
    }
});

// route to create new prescription
app.post("/createPrescription", async (req, res) => {
    try {
        const { doctor, pharmacist, patientId, medicineDetails } = req.body;

        // setting transaction params
        const accounts = await web3.eth.getAccounts();
        const doctorAddress = accounts[doctor]; 
        const pharmacistAddress = accounts[pharmacist];

        const tx = contract.methods.createPrescription(patientId, pharmacistAddress, medicineDetails);
        const gas = await tx.estimateGas({ from: doctorAddress });

        // send transaction
        const receipt = await tx.send({
            from: doctorAddress,
            gas
        });

        res.status(200).json({ success: true, receipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create prescription" });
    }
});

// Endpoint to fulfill a prescription
app.post("/fulfillPrescription", async (req, res) => {
    try {
        const { prescriptionId, pharmacist } = req.body;

        // Set up transaction parameters
        const accounts = await web3.eth.getAccounts();
        const pharmacistAddress = accounts[pharmacist];

        const tx = contract.methods.fulfillPrescription(prescriptionId);
        const gas = await tx.estimateGas({ from: pharmacistAddress });

        // Send the transaction
        const receipt = await tx.send({
            from: pharmacistAddress,
            gas
        });

        res.json({ success: true, receipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fulfill prescription" });
    }
});


// route to view a prescription based on transactionHash
app.get("/viewPrescription/:id", async (req, res) => {
    try {
        const { id } = req.params; // Extract prescription ID from the URL params

        // Call the contract method to fetch prescription details by ID
        const prescription = await contract.methods.viewPrescription(id).call();

        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found" });
        }

        // Return prescription details in the response
        res.json({
            id: prescription[0].toString(),    // Convert id to string if needed
            doctor: prescription[1],           // Doctor's address
            patientId: prescription[2],       // Patient ID
            pharmacist: prescription[3],      // Pharmacist's address
            medicineDetails: prescription[4], // Medicine details
            fulfilled: prescription[5]        // Prescription fulfillment status (true/false)
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch prescription details" });
    }
});



// start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});