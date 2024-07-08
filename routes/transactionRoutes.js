const express = require("express");
const router = express.Router();

const { createTransaction, getMyTransactions, updateTransaction, deleteTransaction } = require("../controllers/transactionController");
const authenticate = require("../middlewares/authentication");
const { authorizeRole } = require("../middlewares/authorization");


// Add transaction: 
router.post("/createTransaction", authenticate, createTransaction);

// Get my transactions: 
router.get("/myTransactions", authenticate, getMyTransactions);

// Update transaction details: 
router.put("/updateTransaction/:transactionId", authenticate, authorizeRole("admin"), updateTransaction);

// Delete transaction details:
router.delete("/deleteTransaction/:transactionId", authenticate, deleteTransaction);


module.exports = router;