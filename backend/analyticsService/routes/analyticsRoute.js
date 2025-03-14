const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/prescription-volume", analyticsController.getPrescriptionVolume);
router.get("/emergency-analysis", analyticsController.getEmergencyAnalysis);
router.get("/drug-demand", analyticsController.getDrugDemand);
router.get("/flagged-prescriptions", analyticsController.getFlaggedPrescriptions);
router.get("/diagnosis-comparison", analyticsController.getDiagnosisComparison);

module.exports = router;
