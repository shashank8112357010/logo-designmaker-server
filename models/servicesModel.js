
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const servicesSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "userModel"
    },
    service: {
        // type: [{
        type: String,
        enum: ["Logo Design", "Magazine Design"],
        // }],
        required: true,
    },
    status: {
        type: String,
        enum: ["Completed", "Pending", "Cancelled"],
        default: "Pending",
    },
    date: {
        type: String,
        // type: Date,
    },
    time: {
        type: String,
       required : true
    },
    duration: {
        type: String,
    },
    files: [{
        fileURL: {
            type: String,
        },
        fileName: {
            type: String,
        }
    }]
})

const servicesModel = mongoose.model("servicesModel", servicesSchema);

module.exports = servicesModel;