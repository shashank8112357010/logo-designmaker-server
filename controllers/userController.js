const User = require("../models/userModel");
const UserReq = require("../models/userReqModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { upload, uploadFiles } = require("../middlewares/multer");
const { generateOTP } = require("../helper/generate");
const OTP = require("../models/otpModel")
const agenda = require("../helper/sendEmail");
const Token = require("../models/tokenModel");
const { resetPasswordTemplate } = require("../views/resetPasswordMailTemplate");
const { registerTemplate } = require("../views/registerEmailTemplate");
const { otpTemplate } = require("../views/otpEmailTemplate");
const { generateResetToken } = require("../helper/generateResetToken");
const mongoose = require('mongoose');
const { uploadImg } = require("../utils/cloudinary");
const multer = require("multer");
const Preference = require("../models/preferenceModel");


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

        // setting default preferences for user: 
        let data = await Preference.create({ userId: user._id });

        // Sending email to user when registered: 
        const htmlToSend = registerTemplate(user.username);

        await agenda.schedule('in 1 second', 'sendRegisterMail', {
            toSender: workEmail,
            emailSubject: "Register - Logo Design Maker",
            // messageContent: `Welcome to Logo Design Maker. You have been registered successfully!! Your work email is: ${workEmail} and phone number: ${phoneNo}. Thank you for registering`
            htmlToSend
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully!!",
            user,
            data
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

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

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

        // generating token for user: 
        const token = await generateToken(user);
        // generating refresh token:
        const refreshToken = await generateRefreshToken(user);
        const tokenOptions = {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000),         // expires in 2 hours
            httpOnly: true,
        };
        const refreshTokenOptions = {
            expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),        // expires in 5 days
            httpOnly: true,
        };
        res.cookie("token", token, tokenOptions);
        res.cookie("refresh-token", refreshToken, refreshTokenOptions);

        return res.status(201).json({
            success: true,
            message: "Requirements collected..",
            userReq,
            token,
            refreshToken
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get requirements options: (list)
module.exports.getReqOptions = async (req, res) => {
    try {
        // const designRequirementsOptions = await UserReq.find(designRequirements );
        const designRequirementsOptions = UserReq.schema.path('designRequirements').enumValues;
        const nicheOptions = UserReq.schema.path('niche').enumValues;
        const fontOptions = UserReq.schema.path('fontOptions').enumValues;
        const colorOptions = UserReq.schema.path('colorOptions').enumValues;
        return res.status(200).json({
            success: true,
            designRequirements: designRequirementsOptions,
            niche: nicheOptions,
            fontOptions: fontOptions,
            colorOptions: colorOptions,
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

        // getting preferences of user: 
        const preference = await Preference.findOne({ userId: user._id });

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

        // if two factor authentication is enabled, the user will be provided with an OTP for verification:
        if (user.twoFactor === true) {
            // generating and saving OTP for user: 
            const providedOTP = await generateOTP();

            // delete all previous otp: 
            await OTP.deleteMany({ userId: user._id });

            const otpDoc = new OTP({
                userId: user.id,
                otpCode: providedOTP
            });
            await otpDoc.save();

            // sending otp:
            const htmlToSend = otpTemplate(user.username, providedOTP);
            await agenda.schedule('in 1 second', 'sendOTPMail', {
                toSender: workEmail,
                emailSubject: "OTP",
                // messageContent: `The link for your password  reset is: ${resetLink}`
                htmlToSend
            });

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                userId: user._id
            })
        }
        else {
            // jwt token:
            const token = await generateToken(user);
            // generating refresh token:
            const refreshToken = await generateRefreshToken(user);
            const tokenOptions = {
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000),         // expires in 2 hours
                httpOnly: true,
            };
            const refreshTokenOptions = {
                expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),        // expires in 5 days
                httpOnly: true,
            };

            res.cookie("token", token, tokenOptions);
            res.cookie("refresh-token", refreshToken, refreshTokenOptions);

            const userReq = await UserReq.findOne({ userId: user._id })
            // console.log(userReq)
            // console.log(user.ifUserReq)

            // if user has not set up requirements (account set up not done), directed to account set up page and token will be provided when account set up is done: 
            if (!userReq) {
                return res.status(200).json({
                    success: true,
                    message: "You need to set up user requirements first. ",
                    // token,
                    // refreshToken,
                    isUserReq: false,
                    user: {
                        userId: user._id,
                        workEmail: user.workEmail,
                        phoneNo: user.phoneNo,
                        profileImg: user.profileImg,
                        role: user.role,
                        username: user.username,
                        twoFactor: user.twoFactor,
                        generalNotification: preference.generalNotification,
                        platformUpdates: preference.platformUpdates,
                        promotion: preference.promotion
                    }
                })
            }
            else {
                user.isUserReq = true;
                await user.save();
                return res.status(200).json({
                    success: true,
                    message: "Logged in successfully with account set up done",
                    token,
                    refreshToken,
                    isUserReq: true,
                    user: {
                        userId: user._id,
                        workEmail: user.workEmail,
                        phoneNo: user.phoneNo,
                        profileImg: user.profileImg,
                        role: user.role,
                        username: user.username,
                        twoFactor: user.twoFactor,
                        generalNotification: preference.generalNotification,
                        platformUpdates: preference.platformUpdates,
                        promotion: preference.promotion
                    },
                    userReq,
                })
            }
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
        const { userId } = req.params
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User Id required"
            });
        }
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Provide OTP"
            });
        }

        const userDbOTP = await OTP.findOne({ userId })
        if (!userDbOTP) {
            return res.status(404).json({
                success: false,
                message: "OTP Expired"
            })
        }

        // console.log(userDbOTP, "userDbOTP");

        if (userDbOTP.otpCode !== otp) {
            return res.status(401).json({
                success: false,
                message: "Incorrect OTP"
            });
        }


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // getting preferences of user: 
        const preference = await Preference.findOne({ userId: user._id });

        // if correct otp is entered, it should be deleted from the db..
        await OTP.deleteOne({ userId });

        // generating token:
        const token = await generateToken(user);
        // generating refresh token:
        const refreshToken = await generateRefreshToken(user);
        const tokenOptions = {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000),         // expires in 2 hours
            httpOnly: true,
        };
        const refreshTokenOptions = {
            expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),        // expires in 5 days
            httpOnly: true,
        };

        res.cookie("token", token, tokenOptions);
        res.cookie("refresh-token", refreshToken, refreshTokenOptions);

        const userReq = await UserReq.findOne({ userId: user._id })
        // console.log(userReq)
        if (!userReq) {
            return res.status(200).json({
                success: true,
                message: "You need to set up user requirements first. ",
                // token,
                // refreshToken,
                isUserReq: false,
                user: {
                    userId: user._id,
                    workEmail: user.workEmail,
                    phoneNo: user.phoneNo,
                    profileImg: user.profileImg,
                    role: user.role,
                    username: user.username,
                    twoFactor: user.twoFactor,
                    generalNotification: preference.generalNotification,
                    platformUpdates: preference.platformUpdates,
                    promotion: preference.promotion
                }
            })
        }
        else {
            user.isUserReq = true;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Logged in successfully with account set up done",
                token,
                refreshToken,
                isUserReq: true,
                user: {
                    userId: user._id,
                    workEmail: user.workEmail,
                    phoneNo: user.phoneNo,
                    profileImg: user.profileImg,
                    role: user.role,
                    username: user.username,
                    twoFactor: user.twoFactor,
                    generalNotification: preference.generalNotification,
                    platformUpdates: preference.platformUpdates,
                    promotion: preference.promotion
                },
                userReq,
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Users (Admin only): 
module.exports.getAllUsersList = async (req, res) => {
    try {
        // const role = req.user.role;
        // console.log(role);
        // if (role !== 'admin') {
        //     return res.status(401).json({
        //         success: false,
        //         message: "You are not authorized to access the list of all users"
        //     })
        // }

        const pageSize = 4;         // number of documents per page (limit)
        const { pageNum } = req.query;
        // const limit = 5;
        const DocToskip = (pageNum - 1) * pageSize

        const list = await User.find().skip(DocToskip).limit(pageSize);
        return res.status(200).json({
            success: true,
            message: "Users list",
            list
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
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
        if (users.length == 0) {
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

// Get user details: 
module.exports.getUserDetailsAndReq = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const result = await User.aggregate(
            [
                {
                    $match: { _id: user._id }
                },
                {
                    $lookup: {
                        from: "userreqmodels",
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'userRequirements'
                    }
                },
            ]
        )

        // console.log('AggregationRes:', result);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User requirements not found!!",
            })
        }

        const userWithRequirements = result[0];

        return res.status(200).json({
            success: true,
            message: "User details found",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                workEmail: user.workEmail,
                phoneNo: user.phoneNo,
                username: user.username,
                address: user.address,
                city: user.city,
                postalCode: user.postalCode,
                country: user.country,
                profileImg: user.profileImg,
                userRequirements: userWithRequirements.userRequirements
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Edit user requirements: (Choices)
module.exports.editRequirements = async (req, res) => {
    try {
        const userId = req.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        let userReq = await UserReq.findOne({ userId: userId });
        if (!userReq) {
            // userReq = new UserReq({ userId: userId });
            return res.status(400).json({
                success: false,
                message: "You can't edit requirements as you have not added requirements till now"
            })
        }

        const { brandName, slogan, designRequirements, niche, fontOptions, colorOptions } = req.body;

        if (brandName) userReq.brandName = brandName
        if (slogan) userReq.slogan = slogan
        if (designRequirements) userReq.designRequirements = designRequirements
        if (niche) userReq.niche = niche
        if (fontOptions) userReq.fontOptions = fontOptions
        if (colorOptions) userReq.colorOptions = colorOptions

        await userReq.save();

        return res.status(200).json({
            success: true,
            message: "Requirements edited successfully",
            UserReq: {
                userId: user._id,
                brandName: userReq.brandName,
                slogan: userReq.slogan,
                designRequirements: userReq.designRequirements,
                niche: userReq.niche,
                fontOptions: userReq.fontOptions,
                colorOptions: userReq.colorOptions
            }
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
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size should be 1MB only",
                error: true,
            })
        }
        else if (err) {
            return res.status(400).json({
                success: false,
                message: "Error uploading image",
                error: err
            })
        }
        try {
            const { id } = req.user;
            const { firstName, lastName, workEmail, phoneNo, username, address, city, postalCode, country } = req.body;

            // finding the user:
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const userReq = await UserReq.findOne({ userId: id });
            if (!userReq) {
                return res.status(404).json({
                    message: "User requirements not found"
                });
            }

            if (!workEmail || !phoneNo || !username) {
                return res.status(400).json({
                    success: false,
                    message: "Provide workEmail, phoneNo and username"
                })
            }

            // updating profile if details are provided: 
            // if (firstName) user.firstName = firstName;
            // if (lastName) user.lastName = lastName;
            if (firstName) userReq.firstName = firstName;
            if (lastName) userReq.lastName = lastName;
            // if (username) user.username = username;
            if (username) {
                if (username !== req.user.username) {
                    const existingUsername = await User.findOne({ username });
                    if (existingUsername) {
                        return res.status(400).json({
                            success: false,
                            message: "Can't use this username as user with this username already exists.."
                        })
                    }
                    user.username = username;
                }
            }
            // if (workEmail) user.workEmail = workEmail;
            if (workEmail) {
                if (workEmail !== req.user.workEmail) {
                    const existingEmail = await User.findOne({ workEmail });
                    if (existingEmail) {
                        return res.status(400).json({
                            success: false,
                            message: "Can't use this work email as user with this work email already exists.."
                        })
                    }
                    user.workEmail = workEmail;
                }
            }
            // if (phoneNo) user.phoneNo = phoneNo;
            if (phoneNo) {
                if (phoneNo !== req.user.phoneNo) {
                    const existingPhoneNo = await User.findOne({ phoneNo });
                    if (existingPhoneNo) {
                        return res.status(400).json({
                            success: false,
                            message: "Can't use this phone number as user with this phone number already exists.."
                        })
                    }
                    user.phoneNo = phoneNo;
                }
            }
            if (address) user.address = address;
            if (city) user.city = city;
            if (postalCode) user.postalCode = postalCode;
            if (country) user.country = country;

            // if profile image is provided: 
            if (req.file) {
                try {
                    const result = await uploadImg(req.file.path);
                    if (result.success) {
                        user.profileImg = {
                            key: result.public_id,
                            url: result.secure_url,
                        }
                    } else {
                        return res.status(500).json({
                            success: false,
                            message: 'Image upload failed',
                            error: result.message
                        })
                    }
                } catch (error) {
                    return res.status(500).json({
                        success: false,
                        message: 'Image upload failed',
                        error: error.message
                    });
                }

                await user.save();
            }

            await user.save();
            await userReq.save();
            return res.status(200).json({
                success: true,
                message: "Profile updated successfully!!",
                user,
                userReq: {
                    firstName: userReq.firstName,
                    lastName: userReq.lastName
                }
                // user: {
                //     userId: user._id,
                //     workEmail: user.workEmail,
                //     phoneNo: user.phoneNo,
                //     profileImg: user.profileImg,
                //     role: user.role,
                //     username: user.username
                // }
            })
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error updating user profile",
                error: error.message
            });
        }
    })
}

// Change Password: (after login)
module.exports.changePasswordAfterAuth = async (req, res) => {
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
            return res.status(401).json({
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
            message: error.message
        })
    }
}

// change password with authentication (reset link to be sent on email)
module.exports.changePasswordBeforeAuth = async (req, res) => {
    try {
        const { workEmail } = req.body;

        const user = await User.findOne({ workEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const resetToken = await generateResetToken(user._id);

        const tokenDoc = new Token({
            userId: user._id,
            token: resetToken,
            createdAt: new Date(),
        });
        await tokenDoc.save();

        // const resetLink = `http://localhost:4000/api/dashboard/resetPassword/${resetToken}`;
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

        const htmlToSend = resetPasswordTemplate(user.username, resetLink);

        // if user is found: 
        await agenda.schedule('in 1 second', 'sendResetPasswordLink', {
            toSender: workEmail,
            emailSubject: "Password Reset Link",
            // messageContent: `The link for your password  reset is: ${resetLink}`
            htmlToSend
        });

        return res.status(200).json({
            success: true,
            message: "Reset password link sent successfully..",
            resetToken,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// setting new password: 
module.exports.resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { newPassword, confirmPassword } = req.body;

        if (newPassword != confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.. Please enter same password"
            })
        }

        const tokenDoc = await Token.findOne({ token: resetToken });

        console.log(tokenDoc, resetToken, "tokenDoc");

        const tokenExp = new Date(tokenDoc.createdAt)
        tokenExp.setMinutes(tokenExp.getMinutes() + 5);

        // Check if token exists
        if (!tokenDoc || tokenExp < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }

        // Find the user associated with the token
        const user = await User.findById(tokenDoc.userId);

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const workEmail = user.workEmail;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Adjust salt rounds as needed

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Delete the token after successful use
        await Token.deleteOne({ token: resetToken });

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// set notifications: 
module.exports.setPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { generalNotification, platformUpdates, promotion } = req.query;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        let data = await Preference.findOne({ userId: userId });

        if (generalNotification) data.generalNotification = generalNotification
        if (platformUpdates) data.platformUpdates = platformUpdates
        if (promotion) data.promotion = promotion

        await data.save();

        return res.status(200).json({
            success: true,
            message: "Preferences updated",
            data
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
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
            message: error.message
        })
    }
}

// Delete user (to be deleted by admin only):
module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(userId, "userId");

        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        // Find and delete the user by ID
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Upload profile pic: 
module.exports.uploadProfilePicture = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({
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
                    message: error.message
                })
            }
        }
    })
}

// Function to generate token for user: 
const generateToken = async (user) => {
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
}

const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign({
        id: user._id,
        workEmail: user.workEmail,
        role: user.role
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "5d",
        });

    return refreshToken;
}

// shashank
