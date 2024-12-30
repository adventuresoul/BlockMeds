const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// logger
const loggermiddleware = (req, res, next) => {
  const start = Date.now(); // Start timestamp
  
  res.on('finish', () => {
    const end = Date.now(); // End timestamp
    const duration = end - start;
    const currentTimestamp = new Date().toISOString();
    const status = res.statusCode;
    console.log(`[${currentTimestamp}] ${req.method} ${req.url} ${status} - ${duration}ms`);
  });
  
  next();
}

// Middleware to parse URL-encoded data and JSON data
app.use(loggermiddleware);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// connect to MongoDB
const connectToMongoDB = require('./models/db_configuration');
connectToMongoDB();


// Routes
const patientRouter = require('./routes/PatientRoutes');
const doctorRouter = require('./routes/DoctorRoutes');
const pharmacistRouter = require('./routes/PharmacistRoutes');
const hospitalRouter = require('./routes/HospitalRoutes');
const pharmacyRouter = require('./routes/PharmacyRoutes');
const regulatoryBodyRouter = require('./routes/RegulatoryBodyRoutes');
app.use('/user', patientRouter);
app.use('/doctor', doctorRouter);
app.use('/pharmacist', pharmacistRouter);
app.use('/hospital', hospitalRouter);
app.use('/pharmacy', pharmacyRouter);
app.use('/regulatoryBody', regulatoryBodyRouter);

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json('Something broke!', err);
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});