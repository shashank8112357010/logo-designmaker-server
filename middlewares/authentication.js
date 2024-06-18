const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async function (req, res, next) {
    // Get token from request headers
    // const token = req.header('x-auth-token');

    // Check if user is authenticated via session
    // if (req.session /*&& req.session.isLoggedIn*/) {
    //     req.user = req.session.user;
    //     return next();
    // }

    const userToken = req.headers.authorization;
    // console.log(req.headers)
    if (!userToken) {
        return res
            .status(401)
            .json({
                message: "Please authenticate using a token"
            })
    }

    try {
        let token = userToken.split(" ");
        const JWT_TOKEN = token[1];

        // Check if token is missing
        // if (!token)
        if (!JWT_TOKEN) {
            return res.status(401).json({
                msg: 'No token, authorization denied'
            });
        }


        // Verify token
        const decoded = jwt.verify(JWT_TOKEN, process.env.JWT_SECRET);
        // console.log(decoded);

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


