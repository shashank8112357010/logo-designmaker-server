const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new mongoose.Schema({
    workEmail: {
        type: String,
        required: true,
    },
    ticketType: {
        type: String,
    },
    priorityStatus: {
        type: String,
        enum: ["New Tickets", "On-Going Tickets", "Resolved Tickets"],
        required: true,
    },
    // title: {
    //     type: String,
    //     required: true,
    // },
    ticketBody: {
        type: String,
        required: true,
    },
    // status: {
    //     type: String,
    //     enum: ["Open", "In progress", "Closed"],
    //     default: "Open",
    // },
    // priority: {
    //     type: String,
    //     enum: ["Low", "Medium", "High"],
    //     default: "Medium",
    // },
    // createdBy: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'userModel',
    //     required: true,
    // },
    postedAt: {
        type: Date,
        default: Date.now(),
    },
    replies: [
        {
            ticketNumber: {
                type: Schema.Types.ObjectId,
                ref: "ticketModel",
            },
            ticketType: {
                type: String,
            },
            replyBody: {
                type: String,
            },
            priorityStatus: {
                type: String,
                enum: ["New Tickets", "On-Going Tickets", "Resolved Tickets"],
                required: true,
            },
            // createdBy: {
            //     type: Schema.Types.ObjectId,
            //     ref: "userModel",
            // },
            // ..admin
            postedAt: {
                type: Date,
                default: Date.now(),
            },
        }
    ]
})

const ticketModel = mongoose.model('ticketModel', ticketSchema);

module.exports = ticketModel;