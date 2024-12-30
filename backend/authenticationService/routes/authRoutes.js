const express = require("express");
const { authTestRoute, loginRoute } = require("../controllers/authControllers");

// defining router
const router = express.Router();

// API routes

// auth sample-test route
router.get("/test", authTestRoute);
router.post("/login", loginRoute);

module.exports = router;

