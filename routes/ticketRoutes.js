const express = require("express");
const router = express.Router();
const { createTicket, getAllTickets, getTicketById, updateTicket, deleteTicket, reply, closeTicket } = require("../controllers/ticketController");
const authenticate = require("../middlewares/authentication");
const authorize = require("../middlewares/authorization");


// creating ticket: 
router.post("/createTicket", authenticate, createTicket)

// getting all tickets: 
router.get("/getAll", authenticate, authorize("admin"), getAllTickets);

// getting single ticket by ticket id: 
router.get('/getSingleTicket/:id', authenticate, getTicketById);

// update ticket: 
router.put('/updateTicket/:id', authenticate, updateTicket);

// Delete ticket: 
router.delete("/deleteTicket/:id", authenticate, deleteTicket);

// Reply to ticket: 
router.post("/reply/:id", authenticate, authorize('admin'), reply);

// Close ticket: 
router.put("/close/:id", authenticate, authorize('admin'), closeTicket);


module.exports = router