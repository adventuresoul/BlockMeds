// Doctor Model
const mongoose = require("mongoose");
const validator = require("validator");

const DoctorSchema = new mongoose.Schema({
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
    ethereumWalletAddress: {
        type: String,
        required: true,
    },
    profileUrl: {   
        type: String,
        required: false
    },
    specialization: {
        type: String,
        required: true
    },
    medicalLicenseId: {
        type: String,
        required: true
    },
    medicalLicenseCertificateUrl: { 
        type: String,
        required: false,
        default: ''
    }
}, { timestamps: true }
);

// creating collection
// It will create schema if it not exists
module.exports = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);