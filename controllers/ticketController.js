const { generateCustomId } = require("../helper/generate");
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel")

// Creating a ticket: 
module.exports.createTicket = async (req, res) => {
    try {
        const { title, ticketType, priorityStatus, ticketBody } = req.body;
        // getting user id:
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User id is required"
            })
        }

        const username = req.user.username;
        // console.log(username);

        // creating ticket id: 
        const customId = await generateCustomId();

        // creating a new ticket 
        const ticket = await Ticket.create({
            _id: customId,
            userId,
            username,
            title,
            ticketType,
            priorityStatus,
            ticketBody,
        })

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
        const { id } = req.user;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        const pageSize = 3;
        const { pageNum, status } = req.query;
        const DocToskip = (pageNum - 1) * pageSize;

        const filter = {};

        if (status) {
            filter['priorityStatus.label'] = status
        }

        if (user.role === "admin") {
            const allTickets = await Ticket.find(filter);
            const ticketCount = allTickets.length;
            const tickets = await Ticket.find(filter).skip(DocToskip).limit(pageSize);

            if (tickets.length == 0) {
                return res.status(404).json({
                    success: false,
                    message: "No tickets found"
                })
            }

            return res.status(200).json({
                success: true,
                ticketCount,
                tickets,
            })
        }

        // when role is "user":
        filter.userId = id;
        const allTickets = await Ticket.find(filter);
        const ticketCount = allTickets.length;
        const tickets = await Ticket.find(filter).skip(DocToskip).limit(pageSize);
        if (tickets.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No tickets found for user"
            })
        }

        return res.status(200).json({
            success: true,
            ticketCount,
            tickets,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// OPEN TICKET: (Get single ticket by id):
module.exports.getTicketById = async (req, res) => {
    try {
        // getting ticket id from params to open a particular ticket:
        const { id } = req.params;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            })
        }

        return res.status(200).json({
            success: true,
            ticket
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
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

        const userId = req.user.id;
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

// Closing a ticket: (setting priority status: resolved)
module.exports.closeTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
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
            ticket          // updated with status as "resolved"..
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
