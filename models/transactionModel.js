const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'serviceModel',
    },
    status: {
        type: String,
        enum: ["Success", "Pending", "Failed"],
    },
    date: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    // requestBtn: {
    //     type: Boolean,
    //     default: false,
    // }
})