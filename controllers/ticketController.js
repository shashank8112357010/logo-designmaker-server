const mongoose = require("mongoose");
const { generateCustomId } = require("../helper/generate");
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");

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
            message: error.message
        });
    }
}

// // Get All Tickets:  
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

        let pageSize = 3;
        let { ticketTitle, pageNum = 1, status } = req.query;

        pageNum = parseInt(pageNum, 10);
        if (isNaN(pageNum) || pageNum < 1) {
            pageNum = 1;
        }

        let DocToskip = (pageNum - 1) * pageSize;

        const searchQuery = {};

        if (ticketTitle) {
            searchQuery.title = { $regex: ticketTitle, $options: 'i' }
        }
        if (status) {
            searchQuery['priorityStatus.label'] = { $regex: status, $options: 'i' }
        }

        if (user.role === "admin") {
            // console.log("Filter:", filter);
            const allTickets = await Ticket.find(searchQuery);
            const ticketCount = allTickets.length;

            // const tickets = await Ticket.find(filter).skip(DocToskip).limit(pageSize);

            const tickets = await Ticket.aggregate([
                { $match: searchQuery },
                {
                    $lookup: {
                        from: 'usermodels',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'usermodels',
                        localField: 'replies.createdBy',
                        foreignField: '_id',
                        as: 'replyUsers'
                    }
                },
                {
                    $addFields: {
                        replies: {
                            $map: {
                                input: "$replies",
                                as: "reply",
                                in: {
                                    _id: "$$reply._id",
                                    createdBy: "$$reply.createdBy",
                                    username: {
                                        $arrayElemAt: [
                                            "$replyUsers.username",
                                            { $indexOfArray: ["$replyUsers._id", "$$reply.createdBy"] }
                                        ]
                                    },
                                    profileImg: {
                                        $arrayElemAt: [
                                            "$replyUsers.profileImg.url",
                                            { $indexOfArray: ["$replyUsers._id", "$$reply.createdBy"] }
                                        ]
                                    },
                                    ticketId: "$$reply.ticketId",
                                    replyBody: "$$reply.replyBody",
                                    postedAt: "$$reply.postedAt"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        title: 1,
                        ticketType: 1,
                        priorityStatus: 1,
                        ticketBody: 1,
                        postedAt: 1,
                        replies: 1,
                        username: '$user.username',
                        profileImg: '$user.profileImg.url'
                    }
                },
                { $skip: DocToskip },
                { $limit: pageSize }
            ]);
            // console.log("length: ", tickets.length);
            // console.log(tickets);
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

        if (user.role === "user") {
            searchQuery.userId = new mongoose.Types.ObjectId(req.user.id);

            // if (status) {
            //     searchQuery['priorityStatus.label'] = status;
            // }
            // console.log("FILTER:", filter);
            const allTickets = await Ticket.find(searchQuery);
            const ticketCount = allTickets.length;
            // const tickets = await Ticket.find(filter).skip(DocToskip).limit(pageSize);
            // console.log("ALL COUNT", ticketCount);

            // console.log("ALL:", allTickets);
            const tickets = await Ticket.aggregate([
                // { $match: filter },
                {
                    $match: searchQuery
                },
                {
                    $lookup: {
                        from: 'usermodels',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'usermodels',
                        localField: 'replies.createdBy',
                        foreignField: '_id',
                        as: 'replyUsers'
                    }
                },
                {
                    $addFields: {
                        replies: {
                            $map: {
                                input: "$replies",
                                as: "reply",
                                in: {
                                    _id: "$$reply._id",
                                    createdBy: "$$reply.createdBy",
                                    username: {
                                        $arrayElemAt: [
                                            "$replyUsers.username",
                                            { $indexOfArray: ["$replyUsers._id", "$$reply.createdBy"] }
                                        ]
                                    },
                                    profileImg: {
                                        $arrayElemAt: [
                                            "$replyUsers.profileImg.url",
                                            { $indexOfArray: ["$replyUsers._id", "$$reply.createdBy"] }
                                        ]
                                    },
                                    ticketId: "$$reply.ticketId",
                                    replyBody: "$$reply.replyBody",
                                    postedAt: "$$reply.postedAt"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        title: 1,
                        ticketType: 1,
                        priorityStatus: 1,
                        ticketBody: 1,
                        postedAt: 1,
                        replies: 1,
                        username: '$user.username',
                        profileImg: '$user.profileImg.url'
                    }
                },
                { $skip: DocToskip },
                { $limit: pageSize }
            ]);

            // console.log("length: ", tickets.length);
            // console.log(tickets);

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
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// OPEN TICKET: (Get single ticket by id):
module.exports.getTicketById = async (req, res) => {
    try {
        // getting ticket id from params to open a particular ticket:
        const { id } = req.params;
        // const ticket = await Ticket.findById(id);

        const ticket = await Ticket.aggregate([
            { $match: { _id: id } },
            {
                $lookup: {
                    from: 'usermodels',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'usermodels',
                    localField: 'replies.createdBy',
                    foreignField: '_id',
                    as: 'replyUsers'
                }
            },
            {
                $addFields: {
                    replies: {
                        $map: {         // because replies is array
                            input: "$replies",      // particular element of replies array
                            as: "reply",            // name of that particular element
                            in: {
                                _id: "$$reply._id",     // getting reply id
                                createdBy: "$$reply.createdBy",    // getting created by 
                                username: {
                                    $arrayElemAt: [         // arrayElemAt is an aggregation operator
                                        "$replyUsers.username",     // array ki field
                                        { $indexOfArray: ["$replyUsers._id", "$$reply.createdBy"] } // index of that field or element
                                    ]
                                },
                                ticketId: "$$reply.ticketId",
                                profileImg: {
                                    $arrayElemAt: [
                                        "$replyUsers.profileImg.url",
                                        { $indexOfArray: ["$replyUsers._id", "$$reply.createdBy"] }
                                    ]
                                },
                                replyBody: "$$reply.replyBody",
                                postedAt: "$$reply.postedAt"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    title: 1,
                    ticketType: 1,
                    priorityStatus: 1,
                    ticketBody: 1,
                    postedAt: 1,
                    replies: 1,
                    username: '$user.username',
                    profileImg: '$user.profileImg.url'
                }
            },
        ]);

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
            message: error.message
        })
    }
}

// Ticket reply:
module.exports.reply = async (req, res) => {
    try {
        const { ticketId, replyBody } = req.body;
        // if (!ticketId || !replyBody) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Provide the required fields."
        //     })
        // }

        if (!ticketId) {
            return res.status(400).json({
                success: false,
                message: "Provide the ticket ID."
            })
        }

        if (!replyBody) {
            return res.status(400).json({
                success: false,
                message: "Provide the reply body."
            })
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
        const username = req.user.username;
        // const customId = await generateCustomId('Reply');
        let ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            res.status(404).json({
                message: "Ticket not found"
            })
        }

        // if ticket is resolved, can't reply: 
        if (ticket.priorityStatus.label === 'Resolved Ticket') {
            return res.status(400).json({
                success: false,
                message: "Cannot reply to a resolved ticket.."
            })
        }

        const reply = {
            createdBy: userId,
            username,
            ticketId: ticket._id,
            replyBody,
            postedAt: Date.now(),
        }

        // ticket.priorityStatus.label = "On-Going Ticket";
        // ticket.priorityStatus.color = "bg-yellow-500";
        ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            {
                'priorityStatus.label': "On-Going Ticket",
                'priorityStatus.color': "bg-yellow-500"
            },
            { new: true }
        )
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
            message: error.message
        })
    }
}

// // Search a ticket: 
// module.exports.searchTicket = async (req, res) => {
//     try {
//         const { ticketTitle, pageNum = 1, status } = req.query;
//         const searchQuery = {};

//         const userId = req.user.id;
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             })
//         }

//         const pageSize = 3;
//         const DocToskip = (pageNum - 1) * pageSize;

//         if (ticketTitle) {
//             searchQuery.title = { $regex: ticketTitle, $options: 'i' }
//         }
//         if (status) {
//             searchQuery['priorityStatus.label'] = { $regex: status, $options: 'i' }
//         }

//         if (user.role == "admin") {
//             const allTickets = await Ticket.find(searchQuery);
//             const ticketCount = allTickets.length;
//             const tickets = await Ticket.find(searchQuery).skip(DocToskip).limit(pageSize);

//             if (!tickets.length) {
//                 return res.status(200).json({
//                     success: true,
//                     message: "No tickets found",
//                     tickets: []
//                 });
//             }
//             return res.status(200).json({
//                 success: true,
//                 ticketCount,
//                 tickets,
//             })
//         }

//         else {
//             searchQuery.userId = userId;
//             const allTickets = await Ticket.find(searchQuery);
//             const ticketCount = allTickets.length;
//             const tickets = await Ticket.find(searchQuery).skip(DocToskip).limit(pageSize);

//             if (!tickets.length) {
//                 return res.status(200).json({
//                     success: true,
//                     message: "No tickets found",
//                     tickets: []
//                 });
//             }
//             return res.status(200).json({
//                 success: true,
//                 ticketCount,
//                 tickets,
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// Closing a ticket: (setting priority status: resolved)
module.exports.closeTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);

        console.log("Original: ", ticket)

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket is not found"
            })
        }

        // if ticket is already closed:
        if (ticket.priorityStatus.label == "Resolved Ticket") {
            return res.status(200).json({
                success: true,
                message: "Ticket is already closed."
            });
        }

        // ticket.priorityStatus.label = "Resolved Ticket";
        // ticket.priorityStatus.color = "bg-green-500";
        // console.log(ticket);
        // const savedTicket = await ticket.save();
        // console.log("Saved: ", savedTicket);

        const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, { 'priorityStatus.label': "Resolved Ticket", 'priorityStatus.color': "bg-green-500" }, { new: true })
        console.log("updated: ", updatedTicket)
        return res.status(200).json({
            success: true,
            message: "status updated!!",
            // ticket          // updated with status as "resolved"..
            // savedTicket
            updatedTicket
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
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
            message: error.message
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
            message: error.message
        })
    }
}
