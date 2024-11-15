// Hospital model
const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["government", "private"],
        required: true
    },
    localAddress: {
        type: String,
        required: true,
        minlength: 5
    },
    city: {
        type: String, 
        required: true,
        minlength: 2
    },
    state: {
        type: String, 
        required: true,
        minlength: 2
    },
    pincode: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return /^[0-9]{6}$/.test(value.toString()); // regex for checking pincode(6 digits)
            },
            message: "Pincode must be exactly 6 digits"
        }
    },
    latitude: {
        type: Number,
        required: false
    },
    longitude: {
        type: String,
        required: false
    },
    website: {
        type: String,
        required: false,
        validate: {
            validator: function(value) {
                try {
                    new URL(value);
                    return true;
                } catch (error) {
                    return false;
                }
            },
            message: "Invalid URL format"
        }
    },
    contact: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[0-9]{10}$/.test(value); // Validate phone number (10digits)
            }
        }
    },
    hospital_code: {
        type: String,   // will be generated at the time of registration
        required: true
    }
}, { timestamps: true }
);

// creating collection
// It will create schema if it not exists
module.exports = mongoose.Model.Hospital || mongoose.model('Hospital', HospitalSchema);