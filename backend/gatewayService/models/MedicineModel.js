// Medicine model
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    drug: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);