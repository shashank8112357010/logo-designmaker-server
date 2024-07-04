const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const preferenceSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel'
    },
    currency: {
        // type: [{
        type: String,
        enum: ["USD", "INR"],
        default: "USD"
        // }],
    },

    timeZone: {
        type: String,
        enum: ["(GMT-12:00) International Date Line West", "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"],
        default: "(GMT-12:00) International Date Line West"
    },
    generalNotification: {
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

const preferenceModel = mongoose.model("preferenceModel", preferenceSchema);

module.exports = preferenceModel;