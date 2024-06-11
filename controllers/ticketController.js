const Ticket = require("../models/ticketModel");

// Creating a ticket: 
module.exports.createTicket = async (req, res) => {
    try {
        // getting title, description and priority from req.body:
        const { title, description, priority } = req.body;

        // creating a new ticket 
        const newTicket = new Ticket({
            title,
            description,
            priority,
            createdBy: req.user.id,
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

// Get All Tickets:
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


// Ticket reply:
module.exports.reply = async (req, res) => {
    try {
        const { ticketReply } = req.body;
        if (!ticketReply) {
            return res.status(400).json({
                success: false,
                message: "Provide the required field."
            })
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            res.status(404).json({
                message: "Ticket not found"
            })
        }

        // if ticket is closed, can't reply: 
        if (ticket.status === 'Closed') {
            return res.status(400).json({
                success: false,
                message: "Cannot reply to a closed ticket.."
            })
        }

        const reply = {
            ticketReply,
            createdBy: req.user.id,
            createdAt: Date.now()
        }

        ticket.replies.push(reply);
        await ticket.save();

        return res.status(201).json({
            success: true,
            message: "Reply added to the ticket!!"
        })
    } catch (error) {
        return res.status(500).json({
            error,
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