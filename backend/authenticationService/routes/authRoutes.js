const express = require("express");
const { authTestRoute, loginRoute, registerPatient, registerDoctor, registerPharmacist } = require("../controllers/authControllers");

// defining router
const router = express.Router();

// API routes

// auth sample-test route
router.get("/test", authTestRoute);
router.post("/login", loginRoute);
router.post("/register/patient", registerPatient);
router.post("/register/doctor", registerDoctor);    
router.post("/register/pharmacist", registerPharmacist);

module.exports = router;

