const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");

// Creating a ticket: 
module.exports.createTicket = async (req, res) => {
    try {
        const { workEmail, ticketType, priorityStatus, ticketBody } = req.body;

        const user = await User.findOne({ workEmail });
        if (!user) {
            return res.status(200).json({
                success: false,
                message: "User with this email does not exist. So you cannot create ticket.."
            })
        }
        // creating a new ticket 
        const newTicket = new Ticket({
            workEmail,
            ticketType,
            priorityStatus,
            ticketBody,
        });
        const ticket = await newTicket.save();

        return res.status(201).json({
            success: true,
            message: 'Ticket created!!',
            ticket
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get All Tickets: (accessible by admin) 
module.exports.getAllTickets = async (req, res) => {
    try {
        // getting all tickets from DB:
        const tickets = await Ticket.find();

        return res.status(200).json({
            success: true,
            tickets
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error
        })
    }
}


// Get single ticket (by using id):
module.exports.getTicketById = async (req, res) => {
    try {
        // const {id} = req.params.id;
        // const ticket = await Ticket.findById(id)
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            })
        }
        return res.status(200).json({
            ticket
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error
        })
    }
}


// Update a ticket: 
module.exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        return res.status(200).json({
            ticket
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error
        })
    }
}


// Delete ticket: 
module.exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found",
            })
        }

        return res.status(200).json({
            message: "Ticket deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error
        })
    }
}


// Ticket reply: (accessible by admin)
module.exports.reply = async (req, res) => {
    try {
        const { ticketNumber, ticketType, replyBody, priorityStatus } = req.body;
        if (!ticketNumber || !ticketType || !replyBody || !priorityStatus) {
            return res.status(400).json({
                success: false,
                message: "Provide the required fields."
            })
        }

        const ticket = await Ticket.findById(ticketNumber);

        if (!ticket) {
            res.status(404).json({
                message: "Ticket not found"
            })
        }

        // if ticket is resolved, can't reply: 
        if (ticket.priorityStatus === 'Resolved Tickets') {
            return res.status(400).json({
                success: false,
                message: "Cannot reply to a resolved ticket.."
            })
        }

        const reply = {
            ticketNumber: ticket._id,
            ticketType,
            replyBody,
            priorityStatus,
            postedAt: Date.now(),
        }

        ticket.replies.push(reply);
        await ticket.save();

        return res.status(201).json({
            success: true,
            message: "Reply added to the ticket!!",
            ticket
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while adding the reply.",
            error: error.message
        })
    }
}


// Closing a ticket: 
module.exports.closeTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(500).json({
                success: false,
                message: "Ticket is not found"
            })
        }

        // if ticket is already closed:
        if (ticket.status === "Closed") {
            return res.status(200).json({
                message: "Ticket is already closed.."
            })
        }

        ticket.status = "Closed"
        await ticket.save();

        return res.status(200).json({
            success: true,
            message: "status updated!!",
            ticket          //updated with status as closed..
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error
        })
    }
}