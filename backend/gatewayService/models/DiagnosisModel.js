const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
    diagnosisId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,  // Disease name (e.g., "Diabetes Type 2")
        required: true,
        unique: true
    },
    symptoms: {
        type: [String],  // Common symptoms associated with this disease
        default: []
    },
    category: {
        type: String,  
        enum: [
            "Infectious Disease",
            "Chronic Disease",
            "Genetic Disorder",
            "Neurological Disorder",
            "Autoimmune Disease",
            "Cardiovascular Disease",
            "Respiratory Disease",
            "Endocrine Disorder",
            "Gastrointestinal Disorder",
            "Musculoskeletal Disorder",
            "Mental Health Disorder",
            "Skin Disorder",
            "Others"
        ],
        required: true
    },
    severity: {
        type: String,  
        enum: ["Mild", "Moderate", "Severe"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DiagnosisModel = mongoose.models.Diagnosis || mongoose.model('Diagnosis', diagnosisSchema);

module.exports = DiagnosisModel;
