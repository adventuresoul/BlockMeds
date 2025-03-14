const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// swagger autogen
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

// Instance of express app
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


// Connect to MongoDB
const connectToMongoDB = require("./config/db_configuration");
connectToMongoDB();

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  //console.log("Request Headers:", req.headers);
  //console.log("Request Body:", req.body); // Log incoming body
  next();
});

// global error handler
app.use((err, req, res, next) => {
  console.error("Unexpected Error:", err);
  res.status(err.status || 500).json({ success: false, error: err.message || "Internal Server Error" });
});


// Router linking
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});