const express = require('express');
const { pharmacistTestRoute } = require('../controllers/PharmacistController');

// define a router
const router = express.Router();

// API routes
router.get('/test', pharmacistTestRoute);

// export the Pharmacists route
module.exports = router;