const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
    otpCode: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120            // 2 minutes
    }
})

const otpModel = mongoose.model("otpModel", otpSchema)
module.exports = otpModel;