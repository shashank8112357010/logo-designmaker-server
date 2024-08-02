const multer = require("multer");
const Services = require("../models/servicesModel");
const User = require("../models/userModel");
const { uploadFiles } = require("../middlewares/multer");

// create user service:
module.exports.createService = async (req, res) => {
    try {
        // Getting user id from token: 
        const userId = req.user.id;
        // Finding user with id: 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Getting details for creating service: 
        const { name, meetingTopic, service, date, time /*duration*/ } = req.body;

        // Parse the date string to create a Date object (JS Date object..)
        const inputDate = new Date(date);
        console.log("input date = ", inputDate);

        // Parse time string "HH:MM PM"
        // const [timePart, period] = time.split(' ');
        // let [hours, minutes] = timePart.split(':').map(Number);
        let hours = time.hour;
        let minutes = time.minute
        let period = time.period

        // Adjust hours for 12-hour format (conversion done for comparison)
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        // Set the parsed time to the inputDate object
        inputDate.setHours(hours, minutes, 0, 0);

        // checking current date and time: 
        const currentDateTime = new Date();

        // if the input date and time are in the past, service cant be created..
        if (inputDate < currentDateTime) {
            return res.status(400).json({
                success: false,
                message: "Services can't be created for past dates or times."
            });
        }

        // Formatting date and time: 
        const formattedDate = formatDate(inputDate);
        const formattedTime = formatTime(inputDate);

        console.log("formatted date: ", formattedDate);
        console.log("formatted time: ", formattedTime);

        // Finding if there are existing services for the date: 
        const existingService = await Services.find({
            date: formattedDate
        });

        // Can not create service if a date already has 3 services created..
        if (existingService.length == 3) {
            return res.status(400).json({
                success: false,
                message: "3 Services are already booked for the date. Choose another date."
            });
        }

        const userService = await Services.create({
            userId: userId,
            name,
            meetingTopic,
            service,
            status: "Pending",
            date: formattedDate,
            time: formattedTime
        });

        return res.status(201).json({
            success: true,
            message: "Service has been created successfully!!",
            userService
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

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
            message: error.message
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
                message: error.message
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
            message: error.message
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

// Function to format time to 12 hour format: 
function formatTime(time) {
    if (typeof time === 'string') {
        // Assuming time is already in 'HH:MM:SS' format
        return time;
    }

    let t = new Date(time);

    let hour = '' + t.getHours();
    let min = '' + t.getMinutes();
    // let sec = '' + (t.getSeconds());
    let period = 'AM';

    if (hour >= 12) {
        period = 'PM';
        if (hour > 12) {
            hour -= 12;
        }
    }

    if (hour === 0) {
        hour = 12; // Midnight or Noon should be represented as 12
    }

    if (hour.length < 2) hour = '0' + hour;
    if (min.length < 2) min = '0' + min;
    // if (sec.length < 2) sec = '0' + sec;

    // return [hour, min].join(':');
    return `${hour}:${min} ${period}`
}