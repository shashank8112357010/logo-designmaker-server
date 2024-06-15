
const User = require("../models/userModel");
const UserReq = require("../models/userReqModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const upload = require("../middlewares/multer");
const { sendMail } = require("../helper/sendMailQueue");
const { generateOTP, sendOTP } = require("../helper/generate");
const emailQueue = require("../helper/emailQueue");



// REGISTER:
module.exports.register = async (req, res) => {
    try {
        const { workEmail, phoneNo, password, mailAllow, role } = req.body;

        // if role of the user is not provided: 
        // if (!role) {
        //     return res.status(400).json({
        //         message: "Role is required, please provide the role!!",
        //     });
        // }

        // Password encryption: 
        const enc_password = await bcrypt.hash(password, 10);

        // saving details of current user: 
        const user = await User.create({
            workEmail,
            phoneNo,
            password: enc_password,
            mailAllow,
            role,
            // profile: req.file.path,
        })

        await sendMail(
            workEmail,          // user email
            "Welcome to Logo Design Maker",      // subject
            "Welcome to Logo Design Maker. You have been registered successfully!!"     // message
        )

        // emailQueue.add({
        //     to: workEmail,
        //     subject: "Welcome to Logo Design Maker",
        //     text: "Welcome to LOGO DESIGN MAKER. You have been registered successfully."
        // }).then((job) => {
        //     console.log('Job added to the queue:', job.id);
        // }).catch((err) => {
        //     console.error('Error adding job to the queue:', err);
        // });


        // generating token:
        // const token = jwt.sign(
        //     {id: user._id, email},
        //     process.env.JWT_SECRET,       // key
        //     {
        //         expiresIn: "2h",
        //     }
        // )

        // user.token = token,
        // user.password = undefined

        return res.status(200).json({
            success: true,
            message: "User registered successfully!!",
            user,
        })
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// // getting indexes: 
// // const userModel = require('./userModel'); // Import your Mongoose model

// // Get the indexes for the userModel collection
// User.collection.getIndexes((err, indexes) => {
//     if (err) {
//         console.error('Error getting indexes:', err);
//     } else {
//         console.log('Indexes for userModel collection:', indexes);
//     }
// });


// Register user requirements: 
module.exports.setUserRequirements = async (req, res) => {
    try {
        const { id } = req.params.id;
        const { firstName, lastName, businessName, brandName, slogan, designRequirements, niche, other, fontOptions, colorOptions } = req.body;

        const userReq = await UserReq.create({
            userId: id,
            firstName,
            lastName,
            businessName,
            brandName,
            slogan,
            designRequirements,
            niche,
            other,
            fontOptions,
            colorOptions
        });

        res.status(200).json({
            success: true,
            message: "Requirements collected..",
            userReq
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// LOGIN:
module.exports.loginUser = async (req, res) => {
    try {
        const { workEmail, password, keepLoggedIn } = req.body;

        if (!workEmail || !password) {
            res.status(400).json({
                success: false,
                message: "Provide all details!"
            });
        }

        // finding the user with provided mail id: 
        const user = await User.findOne({ workEmail });

        // if user is not found: 
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // checking if provided password is same as the correct password: 
        const matched = await bcrypt.compare(password, user.password);

        // if incorrect password:
        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Wrong password entered!!"
            })
        }

        // correct password:
        // const phone = user.phoneNo;
        // const role = user.role;
        const { phone, role } = user

        const token = jwt.sign(
            { id: user._id, workEmail: user.workEmail, role },      // payload
            process.env.JWT_SECRET,      // jwt-key
            {
                expiresIn: "2h",
            },
        )
        // user.token = token;
        // user.password = undefined

        // await user.save();
        // generating cookies: 
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        if (user.twoFactor === true) {
            // sending OTP to user: 
            const providedOTP = await generateOTP();
            user.otpInfo = {
                otp: providedOTP,
                expiresAt: new Date(Date.now() + 2 * 60 * 1000) // 2 minutes from now
            };
            await user.save();
            await sendOTP(phone, providedOTP);

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
            })
        }
        else {
            return res.status(200).json({
                success: true,
                message: "Logged in successfully",
                token,
            })
        }
        // if two factor is false; directly user will log in:
        // res.status(200).cookie("cookie", token, options).json({
        //     success: true,
        //     token,
        //     user,
        // })
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// otp verification:
module.exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Provide OTP"
            })
        }

        // const userId = req.user;
        // const user = await User.find(userId);

        const user = req.user;

        if (!user.otpInfo) {
            return res.status(404).json({
                success: false,
                message: "OTP not found"
            })
        }

        // if (user.otpInfo.otp != otp || user.otpInfo.expiresAt < Date.now()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Incorrect or expired OTP"
        //     })
        // }

        if (user.otpInfo.expiresAt < Date.now()) {
            // user.otpInfo = null; // Clear expired OTP
            // await user.save();
            return res.status(400).json({
                success: false,
                message: "Expired OTP"
            });
        }

        if (user.otpInfo.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP"
            });
        }


        user.otpInfo = null;
        await user.save();

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }
        return res.status(200).cookie("cookie", user.token, options).json({
            success: true,
            token: user.token,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Searching user: 
module.exports.searchUser = async (req, res) => {
    try {
        const { email, phone } = req.query;

        const searchQuery = {};

        if (email) {
            searchQuery.workEmail = { $regex: email, $options: 'i' };
        }
        if (phone) {
            searchQuery.phoneNo = { $regex: phone };
        }

        const users = await User.find(searchQuery);

        if (!users) {
            return res.status(404).json({
                success: false,
                message: "No users found",
            })
        }

        return res.status(200).json({
            success: true,
            users,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Edit user profile:
module.exports.editProfile = async (req, res) => {
    upload(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    err
                })
            }

            const id = req.user;

            const { firstName, lastName, workEmail, phoneNo, businessName, presentAddress, permanentAddress, city, postalCode, country } = req.body;

            // finding the user:
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // updating profile if details are provided: 
            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            if (businessName) user.businessName = businessName;
            if (workEmail) user.workEmail = workEmail;
            if (phoneNo) user.phoneNo = phoneNo;
            if (presentAddress) user.presentAddress = presentAddress;
            if (permanentAddress) user.permanentAddress = permanentAddress;
            if (city) user.city = city;
            if (postalCode) user.postalCode = postalCode;
            if (country) user.country = country;

            // if profile image is provided: 
            if (req.file) {
                const imgURL = `http://localhost:4000/uploads/${req.file.filename}`;
                user.profileImg.key = req.file.filename;
                user.profileImg.url = imgURL;
            }

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Profile update successfully!!",
                user
            })
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    })
}


// Change Password:
module.exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user;

        // getting phone number of user:
        // const phone = req.user.phoneNo;
        // console.log(phone);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const isMatched = await bcrypt.compare(currentPassword, user.password);

        if (!isMatched) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password",
            })
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}


module.exports.enableTwoFactor = async (req, res) => {
    try {
        const { twoFactor } = req.query;
        console.log(twoFactor)
        await User.findByIdAndUpdate(req.user.id, { twoFactor }, { new: true })
        return res.status(200).json({
            success: true,
            message: `Two factor authentication ${twoFactor == 'true' ? 'enabled' : 'disabled'}`
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}


// Upload profile pic: 
module.exports.uploadProfilePicture = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                err
            })
        } else {
            try {
                const id = req.user;
                const profileImg = req.file ? req.file.path : null;

                if (!profileImg) {
                    return res.status(400).json({
                        message: "No image uploaded"
                    });
                }

                const user = await User.findById(id);
                if (!user) {
                    return res.status(400).json({
                        message: "User not found"
                    });
                }

                const imgURL = `http://localhost:4000/uploads/${req.file.filename}`;
                user.profileImg.key = req.file.filename;
                user.profileImg.url = imgURL;

                await user.save();

                res.status(200).json({
                    success: true,
                    message: "Profile image uploaded successfully...",
                    profileImg
                })
            } catch (error) {
                return res.status(500).json({
                    error: error.message
                })
            }
        }
    })
}

