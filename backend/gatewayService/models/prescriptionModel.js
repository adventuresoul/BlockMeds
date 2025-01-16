const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    prescriptionId: {
        type: Number,
        required: true
    },
    doctorId: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    patientId: {
        type: Number,
        required: true
    },
    drug: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    directions: {
        type: String,
        required: true
    },
    fulfilled: {
        type: Boolean,
        default: false
    },
    emergency: {
        type: Boolean,
        default: false
    },
    justification: {
        type: String
    },
    flagged: {
        type: Boolean,
        default: false
    },
    time: {
        type: Date,
        default: Date.now
    },
    prescriptionCreationTxHash: {
        type: String,
        default: ""
    },
    prescriptionFulfillmentTxHash: { // Fixed typo
        type: String,
        default: ""
    }
});

const PrescriptionModel = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
module.exports = PrescriptionModel;
