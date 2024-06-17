const express = require("express");
const router = express.Router();

const { register, loginUser, uploadProfilePicture, setUserRequirements, searchUser, editProfile, changePassword, verifyOTP, enableTwoFactor, cronJob } = require("../controllers/userController");
const upload = require("../middlewares/multer");
const { registerValidator, loginValidator, requirementsValidator } = require("../validator/userValidator");
const { validate } = require("../middlewares/validate");
const authenticate = require("../middlewares/authentication");
const passport = require('passport');
const { ensureGuest, ensureAuth } = require("../middlewares/googleAuth");
const userModel = require("../models/userModel");
const { sendOTP } = require("../helper/generate");



// user registration: 
router.post("/register", validate(registerValidator), register);
// user requirements: 
router.post("/requirements/:id", authenticate, validate(requirementsValidator), setUserRequirements);
// Login:
router.post("/login", validate(loginValidator), loginUser);
// Verify OTP: 
router.post("/verifyOTP", authenticate, verifyOTP);
// router.post("/verifyOTP/:id", authenticate, verifyOTP);
// edit profile:
router.put("/editProfile", authenticate, editProfile);
// change password:
router.put("/changePassword", authenticate, changePassword);
// twoFactor: 
router.post("/enableTwoFactor", authenticate, enableTwoFactor);



// search users: 
router.get("/search", searchUser);

// upload profile picture:
router.post("/uploadprofile", authenticate, uploadProfilePicture)

// cron job: 
router.post("/cronJob", cronJob);


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

// for logout: 
router.get("/logout", (req, res) => {
    req.logout()
    res.redirect('/')
})


// routes/index.js:
router.get("/", ensureGuest, (req, res) => {
    res.render('login');
})

router.get("/log", ensureAuth, async (req, res) => {
    res.render('index', { userinfo: req.user })
})


module.exports = router;