const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const connectDB = require("./config/db");
const analyticsRoutes = require("./routes/analyticsRoute");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use("/analytics", analyticsRoutes);

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

// Error handling middleware 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json('Something broke!', err);
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});