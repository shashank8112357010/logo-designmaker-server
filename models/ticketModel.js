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
    username: {
        type: String,
        // required: true,
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
        type: Object,
        enum: [{ label: "New Ticket", color: "bg-blue-500" }, { label: "On-Going Ticket", color: "bg-yellow-500" }, { label: "Resolved Ticket", color: "bg-green-500" }],
        required: true,
    },
    ticketBody: {
        type: String,
        required: true,
    },
    postedAt: {
        type: String,
        // default: formatDate(Date.now()),
        default: Date.now(),
    },
    replies: [
        {
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: "userModel",
            },
            ticketId: {
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

// // function to format date to "yyyy-mm-dd" format
// function formatDate(date) {
//     let d = new Date(date)

//     let month = '' + (d.getMonth() + 1)
//     let day = '' + d.getDate()
//     let year = d.getFullYear();

//     if (month.length < 2) month = '0' + month;
//     if (day.length < 2) day = '0' + day;

//     return [year, month, day].join('-');
// }
