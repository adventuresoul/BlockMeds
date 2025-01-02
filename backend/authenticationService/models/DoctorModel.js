// Doctor Model
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
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
    contactNumber: {
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
    specialization: {
        type: [String],
        required: true
    },
    experianceYears: {
        type: Number,
        required: true
    },
    medicalLicenseId: {
        type: String,
        required: true
    },
    medicalLicenseIssuer: {
        type: String,
        required: true
    },
    medicalLicenseCertificateUrl: { // s3 link to certificate
        type: String,
        required: true
    },
    previousHospitals: {
        type: [String],
        default: [],
        validate: {
            validator: function(value) {
                return Array.isArray(value) && value.every(hospital => typeof hospital === "string" && hospital.trim().length > 0);
            },
            message: "All hospital must be non-empty strings"
        }
    },
    currentHospitalCode: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
        required: true
    }
}, { timestamps: true }
);

// creating collection
// It will create schema if it not exists
module.exports = mongoose.Model.Doctor || mongoose.model('Doctor', DoctorSchema);