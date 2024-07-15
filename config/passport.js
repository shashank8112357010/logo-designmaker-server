// passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../helper/generate");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: 'http://localhost:4000/api/dashboard/auth/google/callback',
            scope: ["profile", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, emails } = profile;
                const workEmail = emails[0].value;
                if (!workEmail) {
                    throw new Error("Google does not provide an email address");
                }

                let user = await User.findOne({ googleId: id });

                if (!user) {
                    user = await User.findOne({ workEmail });

                    if (!user) {
                        user = new User({
                            googleId: id,
                            workEmail: workEmail
                        });
                        await user.save();
                    } else {
                        user.googleId = id;
                        await user.save();
                    }
                }

                user.token = await generateToken(user);

                // done(null, { user, token });
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;

// Function to generate token for user:
// const generateToken = async (user) => {
//     const token = jwt.sign(
//         {
//             id: user._id,
//             workEmail: user.workEmail,
//             role: user.role
//         },
//         process.env.JWT_SECRET,
//         {
//             expiresIn: "2h",
//         }
//     );

//     return token;
// }


// passport.serializeUser((user, done) => {
//     done(null, user); // Serialize user along with token
// });

// passport.deserializeUser(async (userData, done) => {
//     try {
//         // Deserialize user from userData
//         done(null, userData.user);
//     } catch (error) {
//         done(error, null);
//     }
// });

// passport.serializeUser((user, done) => {
//     done(null, { id: user._id, token: user.token }); // Serialize user along with token
// });

// passport.deserializeUser(async (userData, done) => {
//     try {
//         // Deserialize user from userData
//         const user = await User.findById(userData.id);
//         done(null, { user, token: userData.token });
//     } catch (error) {
//         done(error, null);
//     }
// });


// const passport = require("passport")
// const GoogleStrategy = require("passport-google-oauth20").Strategy
// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");
// const { generateToken } = require("../controllers/userController");

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
//             callbackURL: 'http://localhost:4000/api/dashboard/auth/google/callback',
//         },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 const { id, emails } = profile;
//                 const workEmail = emails[0].value;

//                 // console.log("Profile: ", profile);
//                 if (!workEmail) {
//                     throw new Error("Google does not provide an email address");
//                 }

//                 // finding or creating user:
//                 let user = await User.findOne({ googleId: id });
//                 if (!user) {
//                     user = await User.findOne({ workEmail });
//                     if (!user) {
//                         user = new User({
//                             googleId: id,
//                             workEmail: workEmail
//                         });
//                         await user.save();
//                     } else {
//                         user.googleId = id;
//                         await user.save();
//                     }

//                 }

//                 // const token = generateToken(user);

//                 done(null, user);
//                 // return done(null, { user, token });
//             } catch (error) {
//                 done(error, null);
//             }
//         }
//     )
// )

// passport.serializeUser((user, done) => {
//     done(null, user.id);
//     // done(null, user.user._id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     } catch (error) {
//         done(error, null);
//     }
// })



