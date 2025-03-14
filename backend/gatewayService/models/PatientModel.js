// PATIENT MODEL
const mongoose = require('mongoose');
const validator = require("validator");

// patient collection schema
const patientSchema = new mongoose.Schema({
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
    uniqueId: {
        type: Number,
        required: true,
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
        required: false,
        default: ''
    },
    prescriptionHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'  // Reference to the Prescription model
    }]
}, { timestamps: true }
);

// creating collection
// It will create schema if it not exists
module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);