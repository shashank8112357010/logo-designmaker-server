const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userReqSchema = new Schema({
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
        type: [{
            type: String,
            enum: ["Abstract Logos", "Lettermark Logos", "Wordmark Logos"]
        }],
        required: true,
    },
    niche: {
        type: [{
            type: String,
            enum: ["Healthcare", "Technology", "Finance", "Education"]
        }],
        required: true,
    },
    other: {
        type: String,
    },
    fontOptions: {
        type: [{
            type: String,
            enum: ["Roboto", "Sans serif", "Monospace", "Merriweather"]
        }],
        default: [],
    },
    colorOptions: {
        type: [{
            type: String,
            enum: ["GrayScale", "Red", "Blue", "Green"]
        }],
        default: [],
    }
});

const userReqModel = mongoose.model("userReqModel", userReqSchema);

module.exports = userReqModel;