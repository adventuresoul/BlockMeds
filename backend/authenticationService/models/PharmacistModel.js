// Pharmacist model
const mongoose = require('mongoose');
const validator = require("validator");

const PharmacistSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2
    },
    lastName: {
        type: String,
        required: true,
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
    contactNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return validator.isMobilePhone(value);
            }
        }
    },
    email: {
        type: String,
        required: false,
        lowercase: true, // Convert email to lowercase
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
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
    pharmacyLicenseId: {
        type: String,
        required: true
    },
}, { timestamps: true }
); 

// creating collection
// It will create schema if it not exists
module.exports = mongoose.models.Pharmacist || mongoose.model('Pharmacist', PharmacistSchema);