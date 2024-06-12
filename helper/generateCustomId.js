const ticketModel = require('../models/ticketModel');

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

module.exports = generateCustomId;
