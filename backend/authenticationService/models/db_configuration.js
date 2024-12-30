const mongoose = require('mongoose');   // instance of mongoose
require('dotenv').config(); // load env vars

const connectToMongoDB = async () => {
    try{
        const uri = process.env.DB_URL;
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
          };
        await mongoose.connect(uri, options);
        console.log('Connected to MongoDb');
    } catch (error) {
        console.error('Error connecting to MongoDb:', error.message);
    }
};

module.exports = connectToMongoDB;