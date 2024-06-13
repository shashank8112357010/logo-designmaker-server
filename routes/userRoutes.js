const express = require("express");
const router = express.Router();

const { register, loginUser, uploadProfilePicture, setUserRequirements, searchUser, editProfile, changePassword } = require("../controllers/userController");
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
router.post("/requirements/:id", validate(requirementsValidator), setUserRequirements);

// search users: 
router.get("/search", searchUser);

// edit profile:
router.put("/editProfile", authenticate, editProfile);

// change password:
router.put("/changePassword", authenticate, changePassword);

router.post("/login", validate(loginValidator), loginUser)
router.post("/uploadprofile", authenticate, uploadProfilePicture)



router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

// callback (after google has authenticated the user):
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // console.log("--")
        res.redirect("/api/dashboard/log")
    }

    // async (req, res) => {
    //     try {
    //         const { id, emails } = req.user;
    //         const workEmail = emails[0].value;      // assuming google provides email

    //         if (!workEmail) {
    //             throw new Error("Google did not provide an email address!!");
    //         }

    //         // finding or creating user: 
    //         let user = await userModel.findOne({ googleId: id });
    //         if (!user) {
    //             user = await userModel.findOne({ workEmail });
    //             if (!user) {
    //                 user = new userModel({
    //                     googleId: id,
    //                     workEmail: workEmail,
    //                 })
    //                 await user.save();
    //             } else {
    //                 user.googleId = id;
    //                 await user.save();
    //             }
    //         }
    //         req.logIn(user, (err) => {
    //             if (err) return next(err);
    //             res.redirect("/api/dashboard/log");
    //         })
    //     } catch (error) {
    //         console.log("Error during authentication", error);
    //         res.redirect('/');
    //     }
    // }
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