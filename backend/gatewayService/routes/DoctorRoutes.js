const express = require('express');
const { doctorTestRoute } = require('../controllers/DoctorControllers');

// defining router
const router = express.Router();

// API routes
router.get('/test', doctorTestRoute);


// export the Doctors route
module.exports = router;