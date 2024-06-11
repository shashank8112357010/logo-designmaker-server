const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userReqSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    businessName: {
        type: String,
        required: true,
        unique: true,
    },
    brandName: {
        type: String,
        required: true,
    },
    slogan: {
        type: String,
        required: true,
    },
    designRequirements: {
        type: String,
        enum: ["Abstract Logos", "Lettermark Logos", "Wordmark Logos"]
    },
    niche: {
        type: String,
        enum: ["Healthcare", "Technology", "Finance", "Education"]
    },
    other: {
        type: String,
    },
    fontOptions: {
        type: String,
        enum: ["Serif", "Sans serif", "Monospace"]
    },
    colorOptions: {
        type: String,
        enum: ["Red", "Green", "Blue"]
    }
})


const userReqModel = mongoose.model("userReqModel", userReqSchema);

module.exports = userReqModel;