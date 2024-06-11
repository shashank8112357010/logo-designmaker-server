const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Open", "In progress", "Closed"],
        default: "Open",
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium",
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    replies: [
        {
            ticketReply: {
                type: String,
            },
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: "userModel",
            },
            createdAt: {
                type: Date,
                default: Date.now(),
            },
        }
    ]
})

const ticketModel = mongoose.model('ticketModel', ticketSchema);

module.exports = ticketModel;