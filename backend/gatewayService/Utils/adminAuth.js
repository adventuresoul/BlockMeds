require('dotenv').config();

const jwt = require('jsonwebtoken');
const admin_name = process.env.ADMIN_NAME;
const secret = process.env.SECRET_KEY;

const createToken = () => {
    try {
        return jwt.sign({ username: admin_name }, secret, { expiresIn: '1h' });
    }
    catch (error) {
        console.log(error);
        return error;
    }
};

const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        if (decoded.username === admin_name) {
        next(); 
        } else {
        res.status(403).json({ message: 'Access denied' });
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
    

module.exports = { createToken, authenticateAdmin  };