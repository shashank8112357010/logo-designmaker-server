const multer = require("multer");
const Services = require("../models/servicesModel");
const User = require("../models/userModel");
const { uploadFiles } = require("../middlewares/multer");

// create user service:
module.exports.createService = async (req, res) => {
    try {
        const userId = req.user.id;
        // console.log("userID: ", userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const { service, date, /*duration*/ } = req.body;

        let currentDate = Date.now()
        const currentFormattedDate = formatDate(currentDate);
        console.log("current date: ", currentDate);
        console.log("current formatted date: ", currentFormattedDate)

        const formattedDate = formatDate(date);
        console.log("date: ", date);
        console.log("formattedDate: ", formattedDate)

        // if (formattedDate == 'NaN-NaN-NaN') {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Invalid date provided. Select a valid date"
        //     });
        // }

        const existingService = await Services.find({
            date: formattedDate
        })

        // console.log(existingService)

        if (existingService.length == 3) {
            return res.status(400).json({
                success: false,
                message: "3 Services are already booked for the date. Choose another date.."
            })
        }

        // // service can not be created for previous date: 
        // if (date <= Date.now()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Services can't be created for past dates..",
        //     })
        // }
        if (formattedDate < currentFormattedDate) {
            return res.status(400).json({
                success: false,
                message: "Services can't be created for past dates..",
            })
        }

        const userService = await Services.create({
            userId: userId,
            service,
            status : "Pending",
            date: formattedDate,
            // duration
        });

        return res.status(201).json({
            success: true,
            message: "Service has been created successfully!!",
            userService
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// Get services of a user: 
module.exports.getMyServices = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pageNum } = req.query;
        // console.log(id);
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const pageSize = 3;
        const DocToskip = (pageNum - 1) * pageSize;

        const myServices = await Services.find({ userId: userId }).skip(DocToskip).limit(pageSize);

        if (myServices.length == 0) {
            return res.status(404).json({
                success: false,
                message: "Services not found for user"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Services found!!",
            myServices
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// update Service: (ADMIN SIDE)
module.exports.updateService = async (req, res) => {
    uploadFiles(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: "File size too large.. Maximum size should be 1MB only",
                error: true,
            })
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: "Error uploading files",
                error: err
            });
        }
        try {
            // const userId = req.user.id;
            const { serviceId } = req.params;

            let userService = await Services.findById(serviceId);
            if (!userService) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found!!",
                });
            }

            if (req.files && req.files.length > 0) {
                const filesArray = [];
                for (const file of req.files) {
                    const result = await uploadImg(file.path);
                    // console.log(result)
                    filesArray.push({
                        fileURL: result.secure_url,
                        fileName: `${userService.service} - ${result.public_id}`
                    });
                }
                userService.files = filesArray;
            }

            userService.status = "Completed"
            await userService.save()

            // userService = await Services.findByIdAndUpdate(serviceId, { status: "Completed" }, { new: true });

            return res.status(200).json({
                success: true,
                message: "Service updated successfully",
                userService,
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    })
}

// delete a service: 
module.exports.deleteService = async (req, res) => {
    try {
        // const userId = req.user.id;
        const { serviceId } = req.params;

        // const user = await User.findById(userId);
        // if (!user) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "User not found",
        //     })
        // }

        const myService = await Services.findByIdAndDelete(serviceId);
        if (!myService) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        return res.status(204).json({
            success: true,
            message: "Service deleted successfully.."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

// function to format date to "yyyy-mm-dd" format
function formatDate(date) {
    let d = new Date(date)

    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
