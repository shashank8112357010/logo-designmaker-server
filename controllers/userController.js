
const User = require("../models/userModel");
const UserReq = require("../models/userReqModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const upload = require("../middlewares/multer");
const { sendMail, sendOTPMail } = require("../helper/sendMailQueue");
const { generateOTP, sendOTP } = require("../helper/generate");
const emailQueue = require("../helper/emailQueue");
const OTP = require("../models/otpModel")
const cron = require("node-cron");

// REGISTER USER:
module.exports.register = async (req, res) => {
    try {
        const { workEmail, username, phoneNo, password, mailAllow, role } = req.body;

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
            username,
            phoneNo,
            password: enc_password,
            mailAllow,
            role,
            // profile: req.file.path,
        })

        await sendMail(
            workEmail,          // user email
            "Welcome to Logo Design Maker",      // subject
            "Welcome to Logo Design Maker. You have been registered successfully!!"     // message to be sent
        )

        // generating token:
        // const token = jwt.sign(
        //     {id: user._id, email},
        //     process.env.JWT_SECRET,       // key
        //     {
        //         expiresIn: "2h",
        //     }
        // )

        return res.status(200).json({
            success: true,
            message: "User registered successfully!!",
            user,
        })
    } catch (error) {
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
        const { id } = req.params;
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

        return res.status(200).json({
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
// session (login):
module.exports.loginUser = async (req, res) => {
    try {
        const { workEmail, password, keepLoggedIn } = req.body;

        if (!workEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Provide all details!"
            });
        }

        // finding the user with provided mail id: 
        const user = await User.findOne({ workEmail });

        // if user is not found: 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // if boolean value keepLoggedIn is provided; update the value in DB:
        if (keepLoggedIn) {
            user.keepLoggedIn = keepLoggedIn
        }
        await user.save();

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
        // const { phoneNo, role } = user

        // Setting Session Data: 
        // req.session.isLoggedIn = true;
        req.session.user = user;

        const token = await generateToken(user);


        // generating cookies: 
        // const options = {
        //     expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        //     httpOnly: true,
        // };
        // console.log("Reaching outside", user)

        if (user.twoFactor === true) {

            // console.log("Reachung iniside")
            // generating and saving OTP for user: 
            const providedOTP = await generateOTP();
            // console.log(providedOTP)
            const otpDoc = new OTP({
                userId: user.id,
                otpCode: providedOTP
            });
            await otpDoc.save();

            user.otp = otpDoc._id;
            await user.save();
            // sending otp:
            // await sendOTP(phoneNo, providedOTP);
            await sendOTPMail(
                workEmail,
                "OTP for Login",
                `The OTP for login is: ${providedOTP}`
            )

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                // token
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
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// VERIFY OTP:
module.exports.verifyOTP = async (req, res) => {
    try {
        // const { id } = req.params;
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Provide OTP"
            });
        }

        const user = await User.findById(req.user._id).populate('otp');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // Check OTP expiration (optional step)
        const otpExpiration = new Date(user.otp.createdAt);
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 2); // OTP expires after 2 minutes

        if (otpExpiration < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Expired OTP"
            });
        }

        if (!user.otp || user.otp.otpCode !== otp) {
            return res.status(400).json({
                success: false,
                message: "Incorrect OTP"
            });
        }

        // Clear OTP after successful verification
        await User.findByIdAndUpdate(
            { _id: user._id },
            { $unset: { otp: 1 } } // Unset OTP field
        );
        await OTP.deleteOne({ _id: user.otp._id });

        const token = await generateToken(user);
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        return res.status(200).cookie("cookie", user.token, options).json({
            success: true,
            token,
            user: {
                workEmail: user.workEmail,
                phoneNo: user.phoneNo,
                profileImg: user.profileImg,
                role: user.role,
                username: user.username
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



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

            const { firstName, lastName, workEmail, phoneNo, username, presentAddress, permanentAddress, city, postalCode, country } = req.body;

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
            if (username) user.username = username;
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

// ENABLE TWO FACTOR: 
module.exports.enableTwoFactor = async (req, res) => {
    try {
        const { twoFactor } = req.query;

        // console.log(req.user, "req.user-------");
        const userDoc = await User.findByIdAndUpdate(req.user.id, { twoFactor }, { new: true })
        // console.log(userDoc, "userDoc")
        // await userDoc.save()
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


// cron job:
module.exports.cronJob = async (req, res) => {
    // cron.schedule("* * * * * *", () => {
    //     console.log("running");
    // })       // every second

    // cron.schedule("*/4 * * * * *", () => {
    //     console.log("running");
    // })       // every 4 sec

    const { workEmail } = req.body;
    if (!workEmail) {
        return res.status(400).json({
            success: false,
            message: "Work Email is needed"
        })
    }

    cron.schedule(
        "*/3 * * * * *",
        async function () {
            await sendMail(
                workEmail,
                "Testing cron jobs",
                "Hello... 3"
            )
        }
    )

    return res.status(200).json({
        success: true,
        message: "Email sent successfully"
    })
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


const generateToken = async (user) => {
    try {
        if (!user || !user._id || !user.workEmail || !user.role) {
            throw new Error('User object is invalid or missing required properties');
        }

        const token = jwt.sign(
            {
                id: user._id,
                workEmail: user.workEmail,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h",
            }
        );

        return token;
    } catch (err) {
        console.error('Error generating JWT token:', err);
        return null; // or throw the error as needed
    }
}