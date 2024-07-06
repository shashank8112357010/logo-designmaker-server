const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = mongoose.Schema({
    userId: Schema.Types.ObjectId,
})