const express = require("express");
const router = express.Router();

const { register, loginUser, uploadProfilePicture, setUserRequirements, searchUser, editProfile, verifyOTP, enableTwoFactor, resetPassword, changePasswordAfterAuth, changePasswordBeforeAuth, deleteUser, getUserDetailsAndReq, getReqOptions, getAllUsersList, editRequirements, setPreferences, createService, getMyServices, updateService, deleteService, createTransaction, getMyTransactions } = require("../controllers/userController");
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

// create user service: 
router.post("/createService", authenticate, createService);

// get my services: 
router.get("/myServices", authenticate, getMyServices);

// update service: 
router.put("/updateService/:serviceId", authenticate, authorizeRole("admin"), updateService);

// delete a service: 
router.delete("/deleteService/:serviceId", authenticate, deleteService);

// Add transaction: 
router.post("/createTransaction", authenticate, createTransaction);

// Get my transactions: 
router.get("/myTransactions", authenticate, getMyTransactions);

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
router.get("/search", authenticate, searchUser);
// upload profile picture:
router.post("/uploadprofile", authenticate, uploadProfilePicture)



// for logout: 
router.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router;