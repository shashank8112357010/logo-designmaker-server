const ticketModel = require('../models/ticketModel');
const { generateResetToken } = require('./generateResetToken');
const jwt = require('jsonwebtoken')

// creating id for tickets: 
const generateCustomId = async () => {
    const year = new Date().getFullYear();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const customId = `${year}-CS${randomPart}`;

    // if custom ID already exists
    const existingTicket = await ticketModel.findById(customId);
    if (existingTicket) {
        // If ID exists, generate a new one recursively
        return generateCustomId();
    }
    return customId;
};

// generating otp for password change: (4 digit OTP)
const generateOTP = async () => {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code;

}

// Function to generate token for user: 
const generateToken = async (user) => {
    const token = jwt.sign(
        {
            id: user._id,
            workEmail: user.workEmail,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h",
        }
    );

    return token;
}

const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign({
        id: user._id,
        workEmail: user.workEmail,
        role: user.role
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "5d",
        });

    return refreshToken;
}

module.exports = { generateCustomId, generateOTP, generateToken, generateRefreshToken };
