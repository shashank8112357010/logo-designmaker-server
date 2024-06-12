const mongoose = require("mongoose");
const generateCustomId = require("../helper/generateCustomId");
const Schema = mongoose.Schema;

const ticketSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    title: {
        type: String,
        required: true,
    },
    ticketType: {
        type: String,
        enum: ["Finance", "Design"],
    },
    priorityStatus: {
        type: String,
        enum: ["New Tickets", "On-Going Tickets", "Resolved Tickets"],
        required: true,
    },
    ticketBody: {
        type: String,
        required: true,
    },
    postedAt: {
        type: Date,
        default: Date.now(),
    },
    replies: [
        {
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: "userModel",
            },
            ticketNumber: {
                type: String,
                ref: "ticketModel",
            },
            replyBody: {
                type: String,
            },
            postedAt: {
                type: Date,
                default: Date.now(),
            },
        }
    ]
})

const ticketModel = mongoose.model('ticketModel', ticketSchema);

module.exports = ticketModel;