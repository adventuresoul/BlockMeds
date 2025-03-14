const express = require("express");
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
require("dotenv").config();

// Initialize app and web3
const app = express();
app.use(express.json());

const API_KEY = process.env.BLOCKCHAIN_SERVICE_API_KEY;

const apiKeyMiddleware = (req, res, next) => {
    //console.log(req.url);
    // if req.url is /docs, skip the API key check
    if (req.url.startsWith('/docs/')) {
        console.log("Skipping API key check for /docs route");
        return next();
    } else {
        const apiKey = req.headers['authorization'];
        if (!apiKey || apiKey !== `${API_KEY}`) {
            console.log("Invalid or missing API key");
            return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
        }
        next();
    }  
};

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

// Apply middleware to all routes
app.use(apiKeyMiddleware, loggermiddleware);

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    //console.log("Request Headers:", req.headers);
    //console.log("Request Body:", req.body); // Log incoming body
    next();
});

// Routes
app.use("/", require("./routes/prescriptionRoutes"));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// global error handler
app.use((err, req, res, next) => {
    console.error("Unexpected Error:", err);
    res.status(err.status || 500).json({ success: false, error: err.message || "Internal Server Error" });
  });

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
