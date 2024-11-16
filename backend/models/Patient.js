// PATIENT MODEL
const mongoose = require('mongoose');

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
    emergencyContactNumber: {
        type: String,
        required: false,
        validate: {
            validator: function (value) {
                return !value || /^[0-9]{10}$/.test(value); 
            },
            message: "Emergency contact number must be between 10 and 15 digits"
        }
    },
    bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
        required: true
    },
    allergies: {
        type: [String],
        default: [],
        validate: {
            validator: function (value) {
                return Array.isArray(value) && value.every(allergy => typeof allergy === "string" && allergy.trim().length > 0);
            },
            message: "All allergies must be non-empty strings"
        }
    },
    chronicConditions: {
        type: [String],
        default: [],
        validate: {
            validator: function (value) {
                return Array.isArray(value) && value.every(condition => typeof condition === "string" && condition.trim().length > 0);
            },
            message: "All chronic conditions must be non-empty strings"
        }
    },
    currentMedications: {   // will get updated once the contract if fulfiled, doctor sees this only and prescribes
        type: [String],
        default: [],
        validate: {
            validator: function (value) {
                return Array.isArray(value) && value.every(medication => typeof medication === "string" && medication.trim().length > 0);
            },
            message: "All current medications must be non-empty strings"
        }
    },
    prescriptionHistory: {
        type: [String],  // Array of strings
        required: false,
        default: [],
        validate: {
            validator: function(value) {
                // Ensure each time value is an array and each element is a valid transaction ID (Ethereum transaction hash)
                return Array.isArray(value) && value.every(transactionId => typeof transactionId === "string" && /^(0x)?[0-9a-fA-F]{64}$/.test(transactionId));
            },
            message: "Invalid transaction ID"
        }
    },
    medicalHistory: {
        type: [String],
        default: [],
        validate: {
            validator: function (value) {
                return Array.isArray(value) && value.every(history => typeof history === "string" && history.trim().length > 0);
            },
            message: "All medical history entries must be non-empty strings"
        }
    },
    insuranceProvider: {
        type: String,
        required: false
    },
    insurancePolicyNumber: {
        type: String,
        required: false
    }
}, { timestamps: true }
);

// creating collection
// It will create schema if it not exists
module.exports = mongoose.Model.Patient || mongoose.model('Patient', patientSchema);