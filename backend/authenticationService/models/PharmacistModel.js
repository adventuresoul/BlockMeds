// Pharmacist model
const mongoose = require('mongoose');

const PharmacistSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value <= new Date(); // Ensuring DOB is not in future
            },
            message: "Date of birth cannot be in future"
        }
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    contactNumer: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[0-9]{10}$/.test(value); // Validate phone number (10digits)
            }
        }
    },
    email: {
        type: String,
        required: false,
        lowercase: true, // Convert email to lowercase
        validate: {
            validator: function (value) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value); // Basic email regex
            },
            message: "Invalid email format"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 4
    },
    profileUrl: {   // aws s3 link to image
        type: String,
        required: false
    },
    ethereumPublicKey: {
        type: String, 
        required: false,
        validate: {
            validator: function(value) {
                return /^(0x)?[0-9a-fA-F]{40}$/.test(value); // Ethereum address regex
            }
        }
    },
    medicalLicenseId: {
        type: String,
        required: true
    },
    currentPharmacyCode: {
        type: String,
        required: true
    },

}, { timestamps: true }
); 

// creating collection
// It will create schema if it not exists
module.exports = mongoose.Model.Pharmacist || mongoose.model('Pharmacist', PharmacistSchema);