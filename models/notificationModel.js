const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    currency: {
        // type: [{
        type: String,
        enum: ["USD", "INR"],
        // }],
        required: true,
    },

    timeZone: {
        type: String,
        enum: ["(GMT-12:00) International Date Line West", "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"],
        required: true,
    },
    generalNotifications: {
        type: Boolean,
        default: true,
    },
    platformUpdates: {
        type: Boolean,
        default: false,
    },
    promotion: {
        type: Boolean,
        default: true,
    }
})

const notificationModel = mongoose.model("notificationModel", notificationSchema);

module.exports = notificationModel;