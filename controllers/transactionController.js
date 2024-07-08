// TRANSACTIONS: 
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const Services = require("../models/servicesModel");

// create transaction for user: 
module.exports.createTransaction = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const { serviceId, status, date, amount, refundRequestBtn } = req.body;

        const serviceDetails = await Services.findById(serviceId);
        if (!serviceDetails) {
            return res.status(404).json({
                success: false,
                message: "Service details not found"
            })
        }

        if (serviceDetails.userId != userId) {
            return res.status(403).json({
                success: false,
                message: "This service does not belongs to you!!"
            })
        }
        console.log("serviceDetails: ", serviceDetails);

        const serviceName = serviceDetails.service;
        console.log(serviceName);

        const transaction = await Transaction.create({
            userId: userId,
            serviceId: serviceId,
            serviceName,
            status,
            date,
            amount,
            refundRequestBtn
        })

        return res.status(201).json({
            success: true,
            message: "Transaction details added successfully",
            transaction,

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// get all transactions of a user: 
module.exports.getMyTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const transactions = await Transaction.find({ userId: userId });
        if (transactions.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No transactions found for you"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Transactions found!!",
            transactions
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// Update transaction:
module.exports.updateTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        // const transactionId = req.body;
        const transactionDetails = await Transaction.findById(transactionId);
        if (!transactionDetails) {
            return res.status(404).json({
                success: false,
                message: "No transaction details found!!"
            })
        }

        transactionDetails.status = "Success";
        await transactionDetails.save();

        return res.status(200).json({
            success: true,
            message: "Details updated successfully",
            transactionDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// delete transaction: 
module.exports.deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transactionDetails = await Transaction.findByIdAndDelete(transactionId);
        if (!transactionDetails) {
            return res.status(404).json({
                success: false,
                message: "No transaction details found",
            })
        }
        return res.status(200).json({
            success: true,
            message: "Transaction details deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}
