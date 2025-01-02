const express = require('express');
const { pharmacistTestRoute, registerPharmacist, loginPharmacist } = require('../controllers/PharmacistController');

// define a router
const router = express.Router();

// API routes
router.get('/test', pharmacistTestRoute);
router.post('/register', registerPharmacist);   
router.post('/login', loginPharmacist); 

// export the Pharmacists route
module.exports = router;