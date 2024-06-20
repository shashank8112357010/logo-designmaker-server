const User = require("../models/userModel");
const UserReq = require("../models/userReqModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const upload = require("../middlewares/multer");
const { generateOTP } = require("../helper/generate");
const OTP = require("../models/otpModel")
const agenda = require("../helper/sendEmail");

// REGISTER USER:
module.exports.register = async (req, res) => {
    try {
        const { workEmail, username, phoneNo, password, mailAllow, role } = req.body;

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

        // Sending email to user when registered: 
        await agenda.schedule('in 1 second', 'sendRegisterMail', {
            toSender: workEmail,
            emailSubject: "Welcome to Logo Design Maker",
            messageContent: `Welcome to Logo Design Maker. You have been registered successfully!! Your work email is: ${workEmail} and phone number: ${phoneNo}. Thank you for registering`
        });

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
module.exports.loginUser = async (req, res) => {
    try {
        const { workEmail, password, keepLoggedIn } = req.body;
        if (!workEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Provide all details!"
            });
        }

        // finding the user with provided workEmail : 
        const user = await User.findOne({ workEmail });

        // if user is not found: 
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // if boolean value keepLoggedIn is provided; update the value in DB and save:
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
        // Setting Session Data: 
        req.session.user = user;

        // generating cookies: 
        // const options = {
        //     expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        //     httpOnly: true,
        // };
        // console.log("Reaching outside", user)

        // if two factor authentication is enabled, the user will be provided with an OTP for verification:
        if (user.twoFactor === true) {
            // generating and saving OTP for user: 
            const providedOTP = await generateOTP();
            const otpDoc = new OTP({
                userId: user.id,
                otpCode: providedOTP
            });
            await otpDoc.save();

            user.otp = otpDoc._id;
            await user.save();

            // sending otp:
            await agenda.schedule('in 1 second', 'sendOTPMail', {
                toSender: workEmail,
                emailSubject: "OTP",
                messageContent: `The OTP for login is ${providedOTP}`
            });

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
            })
        }
        else {
            const token = await generateToken(user);
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            return res.status(200).cookie("cookie", token, options).json({
                success: true,
                message: "Logged in successfully",
                token,

            });
        }
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
        if (!req.user || !req.user._id) {
            return res.status(400).json({
                success: false,
                message: "User is not authenticated"
            });
        }
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

        // if user.otp is not found:
        if (!user.otp) {
            return res.status(404).json({
                success: false,
                message: "OTP not found"
            })
        }

        // Check OTP expiration (optional step)
        const otpExpiration = new Date(user.otp.createdAt);
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 2);   // OTP expires after 2 minutes

        if (otpExpiration < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Expired OTP"
            });
        }

        if (user.otp.otpCode !== otp) {
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
        // await OTP.deleteOne({ _id: user.otp._id });

        const token = await generateToken(user);
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        return res.status(200).cookie("cookie", token, options).json({
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

        const userDoc = await User.findByIdAndUpdate(req.user.id, { twoFactor }, { new: true })

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

// Sending greetings mail: (morning)
module.exports.sendGreetingsMorning = async (req, res) => {
    try {
        await agenda.every('00 05 * * *', 'greetingMail_morning', {
            emailSubject: "GREETINGS",
        }, { timezone: 'Asia/Kolkata' });

        return res.status(200).json({
            success: true,
            message: "Morning Greeting emails scheduled successfully"
        });
    } catch (error) {
        console.error('Error scheduling morning greeting emails:', error);
        return res.status(500).json({
            success: false,
            message: "Error scheduling greeting emails"
        });
    }
}

// Sending greetings mail (evening)
module.exports.sendGreetingsEvening = async (req, res) => {
    try {
        await agenda.every('00 19 * * *', 'greetingMail_evening', {
            emailSubject: "GREETINGS",
        }, { timezone: 'Asia/Kolkata' });

        return res.status(200).json({
            success: true,
            message: "Evening greeting emails scheduled successfully"
        });
    } catch (error) {
        console.error('Error scheduling evening greeting emails:', error);
        return res.status(500).json({
            success: false,
            message: "Error scheduling greeting emails"
        });
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

// Function to generate token for user: 
const generateToken = async (user) => {
    try {
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
        return null;
    }
}