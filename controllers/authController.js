// const axios = require('axios');
// const jwt = require('jsonwebtoken');
// const { generateToken } = require('../helper/generate');
// const { oauth2Client } = require('../utils/oauth2client');
// const User = require('../models/userModel');


// // Create and send cookie:
// const createSendToken = (user, statusCode, res) => {
//     const token = generateToken(user);

//     console.log("getting token: ", token)
//     const cookieOptions = {
//         expires: new Date(Date.now() + 2 * 60 * 60 * 1000),         // expires in 2 hours
//         httpOnly: true,
//         path: '/',
//         secure: false,
//         // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         sameSite: "none",
//     }

//     // if (process.env.NODE_ENV === 'production') {
//     //     cookieOptions.secure = true;
//     //     cookieOptions.sameSite = 'none';
//     // }

//     // user.password = undefined;

//     res.cookie("token", token, cookieOptions);

//     // console.log(user);

//     res.status(statusCode).json({
//         message: "Success",
//         token,
//         data: {
//             user,
//         },
//     });
// }


// // Get Google authentication API:
// module.exports.googleAuth = async (req, res) => {

//     console.log("reaching here");

//     const code = req.query.code;
//     console.log("USER CREDENTIAL -> ", code);

//     const googleRes = await oauth2Client.oauth2Client.getToken(code);

//     oauth2Client.oauth2Client.setCredentials(googleRes.tokens);

//     const userRes = await axios.get(
//         `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
//     );

//     let user = await User.findOne({ workEmail: userRes.data.workEmail });

//     if (!user) {
//         console.log('New User found');
//         user = await User.create({
//             // name: userRes.data.name,
//             email: userRes.data.workEmail,
//         });
//     }

//     createSendToken(user, 201, res);
// }



// AuthRoutes.js file:
// const express = require("express");
// const router = express.Router();
// const authController = require('../controllers/authController');

// router.get("/auth/google/callback?code", authController.googleAuth);

// module.exports = router;

// oauth2client.js
// const { google } = require("googleapis");

// const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
// const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
// const GOOGLE_OAUTH_REDIRECT_URI = 'http://localhost:4000/api/dashboard/auth/google/callback';


// exports.oauth2Client = new google.auth.OAuth2(
//     GOOGLE_OAUTH_CLIENT_ID,
//     GOOGLE_OAUTH_CLIENT_SECRET,
//     // 'postmessage',
//     'http://localhost:4000/api/dashboard/auth/google/callback'
//     // GOOGLE_OAUTH_REDIRECT_URI
// )
