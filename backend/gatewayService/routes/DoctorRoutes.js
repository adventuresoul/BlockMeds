const express = require('express');
const { doctorTestRoute, registerDoctor, loginDoctor } = require('../controllers/DoctorControllers');

// defining router
const router = express.Router();

// API routes
router.get('/test', doctorTestRoute);
router.post('/register', registerDoctor);
router.post('/login', loginDoctor); 

// export the Doctors route
module.exports = router;