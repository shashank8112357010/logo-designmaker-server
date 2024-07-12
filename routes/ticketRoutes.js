const express = require("express");
const router = express.Router();
const { createTicket, getAllTickets, getTicketById, updateTicket, deleteTicket, reply, closeTicket, searchTicket, openTicket } = require("../controllers/ticketController");
const authenticate = require("../middlewares/authentication");
const authorize = require("../middlewares/authorization");


// creating ticket: 
router.post("/createTicket", authenticate, createTicket)

// getting all tickets: 
router.get("/getAll", authenticate, getAllTickets);

// open a ticket: 
router.get("/openTicket/:id", authenticate, getTicketById);

// Reply to ticket: 
router.post("/reply", authenticate, reply);

// // search a ticket: 
// router.get("/searchTicket", authenticate, searchTicket);

// Close ticket: 
router.put("/close/:id", authenticate, closeTicket);


// update ticket: 
router.put('/updateTicket/:id', authenticate, updateTicket);

// Delete ticket: 
router.delete("/deleteTicket/:id", authenticate, deleteTicket);


module.exports = router