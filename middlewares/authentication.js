
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateToken } = require("../helper/generate");

module.exports = async function (req, res, next) {
    // Get token from request headers
    const userToken = req.headers.authorization;
    if (!userToken) {
        console.log("ERROR 10");
        return res.status(401).json({
            message: "Please authenticate using a token"
        })
    }

    try {
        let token = userToken.split(" ");
        const JWT_TOKEN = token[1];

        // Check if token is missing
        if (!JWT_TOKEN) {
            console.log("ERROR 22");
            return res.status(401).json({
                msg: 'No token, authorization denied'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(JWT_TOKEN, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                // Token has expired, handle refresh token
                const decoded = jwt.decode(JWT_TOKEN);
                const userId = decoded.id;

                // Fetch user from database using user ID
                const user = await User.findById(userId);

                // Check if user exists
                if (!user || !user.refreshToken) {
                    console.log("ERROR 42");
                    return res.status(401).json({
                        msg: 'User not found or refresh token missing'
                    });
                }

                // Verify refresh token
                jwt.verify(user.refreshToken, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        console.log("ERROR 51");
                        return res.status(401).json({
                            msg: 'Refresh token is not valid'
                        });
                    }

                    // Generate new access token
                    const newToken = generateToken(user);
                    res.setHeader('Authorization', 'Bearer ' + newToken);
                    req.user = user;
                    next();
                });
                return; // Exit early as we're handling the refresh token case
            } else {
                throw err;
            }
        }

        /*
        // Verify token
        const decoded = jwt.verify(JWT_TOKEN, process.env.JWT_SECRET);
        // console.log(decoded);
        */

        // Extract user ID from decoded token
        const userId = decoded.id;
        // console.log(userId);

        // Fetch user from database using user ID
        const user = await User.findById(userId);
        // console.log(user);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Attach user object to request object
        req.user = user;

        // Proceed to the next middleware
        next();
    } catch (err) {
        // Handle token verification errors
        console.error('Token verification failed:', err);
        res.status(401).json({
            msg: 'Token is not valid'
        });
    }
};




// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
// const { generateToken } = require('../helper/generate');

// module.exports = async (req, res, next) => {
//     try {
//         const userToken = req.headers.authorization;
//         // if (userToken && userToken.startsWith('Bearer ')) {
//         if (!userToken) {
//             return res.status(401).json({
//                 message: "Please authenticate using a token"
//             });
//         }

//         // Check if token format is valid
//         // if (!userToken.startsWith('Bearer ')) {
//         //     return res.status(401).json({
//         //         message: "Invalid token format"
//         //     });
//         // }

//         let token = userToken.split(" ");
//         const JWT_TOKEN = token[1];

//         const decodedToken = jwt.verify(JWT_TOKEN, process.env.JWT_SECRET);

//         // check token expiry:
//         if (decodedToken.exp < Date.now() / 1000) {
//             const user = await User.findById(decodedToken.sub);

//             // check user existence:
//             if (!user || !user.refreshToken) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Unauthorized"
//                 })
//             }

//             // verify refresh token:
//             jwt.verify(user.refreshToken, process.env.JWT_SECRET, (err, decoded) => {
//                 if (err) {
//                     return res.status(400).json({
//                         success: false,
//                         message: "Unauthorised",
//                         error: err.message
//                     })
//                 }

//                 // Generate new token:
//                 const token = generateToken(user);
//                 res.setHeader('Authorization', 'Bearer' + token);
//                 next();
//             })
//         } else {
//             req.user = decoded;
//             next();
//         }
//         // }
//         // else {
//         //     return res.status(400).json({
//         //         success: false,
//         //         message: "UNAUTHORISED"
//         //     })
//         // }
//     } catch (error) {
//         console.error('Token verification failed:', error);
//         res.status(401).json({
//             msg: 'Token is not valid'
//         });
//     }

// }

