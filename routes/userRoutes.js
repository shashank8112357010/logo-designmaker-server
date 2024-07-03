const express = require("express");
const router = express.Router();

const { register, loginUser, uploadProfilePicture, setUserRequirements, searchUser, editProfile, verifyOTP, enableTwoFactor, resetPassword, changePasswordAfterAuth, changePasswordBeforeAuth, deleteUser, getUserDetailsAndReq, getReqOptions, getAllUsersList, editRequirements } = require("../controllers/userController");
const { registerValidator, loginValidator, requirementsValidator, resetValidator, afterAuthPasswordValidation } = require("../validator/userValidator");
const { validate } = require("../middlewares/validate");
const authenticate = require("../middlewares/authentication");
const passport = require('passport');
const { resetPasswordScreen } = require("../views/resetPassword");
const Token = require("../models/tokenModel");
const User = require("../models/userModel");
const { authorizeRole } = require("../middlewares/authorization");
const { checkFileSizeMiddleware } = require("../middlewares/multer");


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

// change password: (authentication)
router.put("/changePassword", authenticate, validate(afterAuthPasswordValidation), changePasswordAfterAuth);

// change password without login: 
// Route to display the reset password screen
router.get('/resetPassword/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;
    const tokenDoc = await Token.findOne({ token: resetToken });

    if (!tokenDoc) {
        return res.status(400).json({
            success: false,
            message: 'Invalid token',
        });
    }

    const user = await User.findById(tokenDoc.userId);

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'User not found',
        });
    }

    res.send(resetPasswordScreen(resetToken, user.workEmail));
}, validate(resetValidator));

// providing reset link:
router.post("/resetPasswordLink", changePasswordBeforeAuth);
// changing password:
router.post("/resetPassword/:resetToken", validate(resetValidator), resetPassword);

// twoFactor: 
router.post("/enableTwoFactor", authenticate, enableTwoFactor);

// Delete a user (Admin):
router.delete("/deleteUser/:id", authenticate, authorizeRole("admin"), deleteUser);

// Google OAuth routes: 
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

// callback (after google has authenticated the user):
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // console.log("--")
        res.redirect("/api/dashboard/log")
    }
)

// search users: 
router.get("/search", searchUser);
// upload profile picture:
router.post("/uploadprofile", authenticate, uploadProfilePicture)



// for logout: 
router.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router;