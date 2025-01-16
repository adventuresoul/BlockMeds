const express = require("express");
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
require("dotenv").config();

// Initialize app and web3
const app = express();
app.use(express.json());

const API_KEY = process.env.BLOCKCHAIN_SERVICE_API_KEY;

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['authorization'];
    //console.log(`Request URL: ${req.url}`);
    //console.log(`Authorization Header: ${apiKey}`);
    
    // if req.url is /docs, skip the API key check
    if (req.url === '/docs') {
        console.log("Skipping API key check for /docs route");
        return next();
    } else {
        if (!apiKey || apiKey !== `${API_KEY}`) {
            console.log("Invalid or missing API key");
            return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
        }
        next();
    }  
};

// Apply middleware to all routes
app.use(apiKeyMiddleware);

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

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
