const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    prescriptionId: {
        type: String,
        required: true,
        unique: true
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
        type: String,
        required: true
    },
    diagnosisId: {
        type: String,
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
        type: String,
        default: null
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
        type: String
    },
    prescriptionFulfillmentTxHash: {
        type: String
    }
});

// Prevent re-declaration of the model if already registered
const PrescriptionModel = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);

module.exports = PrescriptionModel;
