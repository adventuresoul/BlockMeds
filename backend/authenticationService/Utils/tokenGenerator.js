const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken(user, roleId) {
    const expirationTime = 60;  // 60 minute expiration time
    let payLoad = null;
    if (roleId === 0) {
        payLoad = {
            userId : user._id.toString(),
            uniqueId: user.uniqueId,
            roleId: roleId
        }
    }
    else {
        payLoad = {
            userId: user._id.toString(),
            roleId: roleId
        }
    }
    
    // create token by taking payload, algorithm and secret and exp time
    const token = jwt.sign(payLoad, process.env.SECRET_KEY, {
        expiresIn: expirationTime * 60
    });
    // return the token
    return token;
}


module.exports = {
    generateToken,
};