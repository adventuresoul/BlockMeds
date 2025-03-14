const mongoose = require('mongoose');   // instance of mongoose
require('dotenv').config(); // load env vars

const connectToMongoDB = async () => {
    try{
        const uri = process.env.DB_URL;
        await mongoose.connect(uri);
        console.log('Connected to MongoDb');
    } catch (error) {
        console.error('Error connecting to MongoDb:', error.message);
    }
};

module.exports = connectToMongoDB;