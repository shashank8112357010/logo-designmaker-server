const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "userModel",
    },
    title: {
        type: String,
        required: true,
    },
    ticketType: {
        type: String,
        // enum: ["Finance", "Design"],
        required: true,
    },
    priorityStatus: {
        type: String,
        enum: ["New Ticket", "On-Going Ticket", "Resolved Ticket"],
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