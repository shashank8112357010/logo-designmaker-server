const ticketModel = require('../models/ticketModel');


// creating id for tickets: 
const generateCustomId = async (type) => {
    const year = new Date().getFullYear();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const customId = `${type}${year}-CS${randomPart}`;

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

// sending message for otp:
// const sendOTP = async (phone, otp) => {
//     return client.messages.create({
//         body: `Your OTP code is ${otp}`,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: `+91${phone}`
//     })
// }




module.exports = { generateCustomId, generateOTP };
