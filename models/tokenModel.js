const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        required: true
    },
    token: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 300        // 5 minutes
    }
})

const tokenModel = mongoose.model('tokenModel', tokenSchema);

module.exports = tokenModel;