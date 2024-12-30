// DoctorControllers.js
const asyncHandler = require('express-async-handler');

const doctorTestRoute = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Doctor Test Route Working!' });
});

module.exports = { doctorTestRoute };