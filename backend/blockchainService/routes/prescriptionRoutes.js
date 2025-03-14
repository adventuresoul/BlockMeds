const express = require("express");

const {
    prescriptionCount,
    createPrescription,
    fulfillPrescription,
    viewPrescription,
    setSafeLimit,
    getSafeLimit,
    getRegulatoryAuthority,
    resolveFlaggedPrescription,
    viewTransaction
} = require("../controllers/prescriptionController");

// defining router
const router = express.Router();

// API routes
router.get("/prescriptionCount", prescriptionCount);
router.post("/createPrescription", createPrescription);
router.post("/fulfillPrescription", fulfillPrescription);
router.get("/viewPrescription/:prescriptionId", viewPrescription);
router.post("/setSafeLimit", setSafeLimit); // Requires the regulatory authority's address
router.get("/getSafeLimit/:drug", getSafeLimit); // Fetch the safe limit for a specific drug
router.get("/getRegulatoryAuthority", getRegulatoryAuthority); // Get the regulatory authority's address
router.post("/resolveFlaggedPrescription", resolveFlaggedPrescription); // Requires the regulatory authority's address
router.get("/viewTransaction/:txHash", viewTransaction);

module.exports = router;
