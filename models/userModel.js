const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    googleId: {
        type: String,
        // required: false,
    },
    workEmail: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    phoneNo: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
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

    role: {
        type: String,
    },

    keepLoggedIn: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "user"
    },
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    presentAddress: {
        type: String,
    },
    permanentAddress: {
        type: String,
    },
    city: {
        type: String,
    },
    postalCode: {
        type: Number,
    },
    country: {
        type: String,
    },

    currentPassword: {
        type: String,
    },
    newPassword: {
        type: String,
    },
})

const userModel = mongoose.model('userModel', userSchema);

module.exports = userModel;