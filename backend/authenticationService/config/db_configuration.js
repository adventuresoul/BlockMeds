const mongoose = require("mongoose");
const assert = require("assert");
require("dotenv").config(); // Load environment variables

const DB_URI = process.env.DB_URI;

// Ensure DB_URI is defined and is a valid string
assert(DB_URI, "❌ DB_URI is missing in .env file");
assert(typeof DB_URI === "string", "❌ DB_URI must be of type string");

const connectToMongoDB = async () => {
    if (mongoose.connection.readyState === 1) {
        console.log("✅ Already connected to MongoDB.");
        return;
    }

    try {
        await mongoose.connect(DB_URI);
        console.log("Successfully connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error.stack);
        process.exit(1); // Exit if connection fails
    }
};

// Graceful shutdown handling
process.on("SIGINT", async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log("MongoDB connection closed due to app termination");
    }
    process.exit(0);
});

module.exports = connectToMongoDB;
