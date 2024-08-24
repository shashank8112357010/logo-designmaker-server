const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    googleId: {
        type: String,
        // required: false,
    },
    workEmail: {
        type: String,
        // required: true,
        unique: true,
        index: true
    },
    phoneNo: {
        type: String,
        // required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        // required: true,
    },
    username: {
        type: String
    },
    mailAllow: {
        type: Boolean,
        default: true,
    },

    profileImg: {
        key: {
            type: String,
        },
        url: {
            type: String,
        }
    },

    keepLoggedIn: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "user"
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    postalCode: {
        type: String,
    },
    country: {
        type: String,
    },
    twoFactor: {
        type: Boolean,
        default: false,
    },
    isUserReq: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    }
})

const userModel = mongoose.model('userModel', userSchema);

module.exports = userModel;