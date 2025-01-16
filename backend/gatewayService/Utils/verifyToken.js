const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify the token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    // If token is not provided
    if (!token) {
        return res.status(403).send('Token is required, please login');
    }
    // Verify the token using jsonwebtoken library
    //console.log(token);
    //console.log(process.env.SECRET_KEY);
    jwt.verify(token, process.env.SECRET_KEY, (err, decodedUser) => {
        if (err) {
            return res.status(401).json(err);
        }
        //console.log(decodedUser);
        // Set req.user = decodedUser
        if (decodedUser.roleId === 0) {
            req.user = {
                uniqueId: decodedUser.uniqueId,
                userId: decodedUser.userId,
                roleId: decodedUser.roleId
            }
        }
        else {
            req.user = {
                userId: decodedUser.userId,
                roleId: decodedUser.roleId
            };
        }
        next();
    });
}

module.exports = { verifyToken };
