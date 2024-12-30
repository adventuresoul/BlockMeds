// PharmacistControllers.js
const asyncHandler = require('express-async-handler');

const pharmacistTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Pharmacist Test Route Working!' });
});

module.exports = { pharmacistTestRoute };