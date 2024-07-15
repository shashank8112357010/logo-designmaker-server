const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken')

const { register, loginUser, uploadProfilePicture, setUserRequirements, searchUser, editProfile, verifyOTP, enableTwoFactor, resetPassword, changePasswordAfterAuth, changePasswordBeforeAuth, deleteUser, getUserDetailsAndReq, getReqOptions, getAllUsersList, editRequirements, setPreferences } = require("../controllers/userController");
const { registerValidator, loginValidator, requirementsValidator, resetValidator, afterAuthPasswordValidation } = require("../validator/userValidator");
const { validate } = require("../middlewares/validate");
const authenticate = require("../middlewares/authentication");
const passport = require('passport');
const { resetPasswordScreen } = require("../views/resetPassword");
const Token = require("../models/tokenModel");
const User = require("../models/userModel");
const { authorizeRole } = require("../middlewares/authorization");
const { checkFileSizeMiddleware } = require("../middlewares/multer");
const { ensureGuest, ensureAuth } = require("../middlewares/googleAuth");


// user registration: 
router.post("/register", validate(registerValidator), register);

// user requirements: 
router.post("/requirements/:id", /*authenticate,*/ validate(requirementsValidator), setUserRequirements);

// Get requirements options: 
router.get("/getRequirementsOptions", getReqOptions);

// Login:
router.post("/login", validate(loginValidator), loginUser);

// Verify OTP: 
router.post("/verifyOTP/:userId", verifyOTP);

// get all users list: (accessible by admin only): 
router.get("/getAllUsers", authenticate, authorizeRole("admin"), getAllUsersList)

// Get user details: 
router.get("/userDetailsAndReq", authenticate, getUserDetailsAndReq);

// Edit user requirements: 
router.put("/editRequirements", authenticate, editRequirements);

// edit profile:
router.put("/editProfile", authenticate, editProfile);

// set notifications: 
router.put("/setPreferences", authenticate, setPreferences);

// change password: (authentication)
router.put("/changePassword", authenticate, validate(afterAuthPasswordValidation), changePasswordAfterAuth);

// providing reset link:
router.post("/resetPasswordLink", changePasswordBeforeAuth);
// changing password:
router.post("/resetPassword/:resetToken", validate(resetValidator), resetPassword);

// twoFactor: 
router.post("/enableTwoFactor", authenticate, enableTwoFactor);

// Delete a user (Admin):
router.delete("/deleteUser/:id", authenticate, authorizeRole("admin"), deleteUser);


// router.get("/", (req, res) => {
//     res.render('login')
// })

// Google OAuth routes: 
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

// // callback (after google has authenticated the user):
// router.get('/auth/google/callback', passport.authenticate('google', {
//     failureRedirect: '/'
// }),
//     async (req, res) => {
//         //     // console.log("--")
//         //     // http://localhost:4000/api/dashboard/auth/google
//         //     // res.redirect("/api/dashboard/log")          // dashboard route for frontend

//         res.redirect(`http://localhost:3000/dashboard/overview`);
//     }
// )

// router.get('/auth/google/callback', passport.authenticate('google', {
//     successRedirect: 'http://localhost:3000/dashboard/overview',
//     failureRedirect: '/', // Redirect to login page on failure
// }), async (req, res) => {
//     const token = req.user.token; // Access token from serialized user data

//     console.log("Token: ", token);

//     // // Redirect to overview page with token
//     res.redirect(`http://localhost:3000/dashboard/overview?token=${token}`);

//     // res.redirect(`http://localhost:3000/dashboard/overview`);
// });


// router.get('/auth/google/callback', passport.authenticate('google', {
//     failureRedirect: '/', // Redirect to login page on failure
// }), async (req, res) => {
//     const token = req.user.token; // Access token from serialized user data

//     // const token = await generateToken(user);

//     res.cookie('authToken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production', // Set to true in production
//         maxAge: 2 * 60 * 60 * 1000, // 2 hours
//     });

//     console.log("Token: ", token);

//     // console.log("cookie ", authToken);

//     res.redirect('http://localhost:3000/dashboard/GoogleAuthCallback');
// });

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/', // Redirect to login page on failure
}), async (req, res) => {
    const token = req.user.token; // Access token from serialized user data

    console.log("token: ", token);
    res.redirect(`http://localhost:3000/auth/GoogleAuthCallback?token=${token}`);
    // Send the token as a JSON response
    // res.status(200).json({ token });
});

// search users: 
router.get("/search", authenticate, searchUser);
// upload profile picture:
router.post("/uploadprofile", authenticate, uploadProfilePicture)



// for logout: 
router.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})

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

module.exports = router;