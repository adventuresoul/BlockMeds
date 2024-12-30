// Pharmacy model
const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4
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
    contact: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[0-9]{10}$/.test(value); // Validate phone number (10digits)
            }
        }
    },
    pharmacy_code: {
        type: String,   // will be generated at the time of registration
        required: true
    }
}, { timestamps: true }
);

// creating collection
// It will create schema if it not exists
module.exports = mongoose.Model.Pharmacy || mongoose.model('Pharmacy', PharmacySchema);