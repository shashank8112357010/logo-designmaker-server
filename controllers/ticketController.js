const generateCustomId = require("../helper/generateCustomId");
const Ticket = require("../models/ticketModel");

// Creating a ticket: 
module.exports.createTicket = async (req, res) => {
    try {
        const { title, ticketType, priorityStatus, ticketBody } = req.body;
        const customId = await generateCustomId('Ticket');

        // creating a new ticket 
        const newTicket = new Ticket({
            _id: customId,
            title,
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


// Ticket reply:
module.exports.reply = async (req, res) => {
    try {
        const { ticketNumber, replyBody } = req.body;
        if (!ticketNumber || !replyBody) {
            return res.status(400).json({
                success: false,
                message: "Provide the required fields."
            })
        }

        const userId = req.user;
        // const customId = await generateCustomId('Reply');

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
            createdBy: userId,
            ticketNumber: ticket._id,
            replyBody,
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


// Search a ticket: 
module.exports.searchTicket = async (req, res) => {
    try {
        const { ticketTitle, ticketNo } = req.query;

        const searchQuery = {};

        if (ticketTitle) {
            searchQuery.title = { $regex: ticketTitle, $options: 'i' }
        }
        if (ticketNo) {
            searchQuery._id = { $regex: ticketNo, $options: 'i' }
        }

        const tickets = await Ticket.find(searchQuery);

        if (!tickets.length) {
            return res.status(200).json({
                success: true,
                message: "No tickets found",
                tickets: []
            });
        }

        return res.status(200).json({
            success: true,
            tickets,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Closing a ticket: (priority status: resolved)
module.exports.closeTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        // const ticketId = req.query;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(500).json({
                success: false,
                message: "Ticket is not found"
            })
        }

        // if ticket is already closed:
        if (ticket.priorityStatus === "Resolved Tickets") {
            return res.status(200).json({
                message: "Ticket is already closed.."
            })
        }

        ticket.priorityStatus = "Resolved Tickets"
        await ticket.save();

        return res.status(200).json({
            success: true,
            message: "status updated!!",
            ticket          //updated with status as resolved..
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
