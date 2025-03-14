const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
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
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// Serve Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// connect to MongoDB
const connectToMongoDB = require('./models/db_configuration');
connectToMongoDB();


// Routes
const patientRouter = require('./routes/PatientRoutes');
const doctorRouter = require('./routes/DoctorRoutes');
const pharmacistRouter = require('./routes/PharmacistRoutes');
const regulatoryBodyRouter = require('./routes/RegulatoryBodyRoutes');
app.use('/patient', patientRouter);
app.use('/doctor', doctorRouter);
app.use('/pharmacist', pharmacistRouter);
app.use('/regulatoryBody', regulatoryBodyRouter);

app.use((req, res, next) => {
  console.log(`Incoming request from ${req.ip} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json('Something broke!', err);
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});