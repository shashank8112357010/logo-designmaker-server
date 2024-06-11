
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const mongoose = require('mongoose')
const User = require("../models/userModel");


module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
                clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
                callbackURL: 'http://localhost:4000/api/dashboard/auth/google/callback'
            },
            async (accessToken, refreshToken, profile, done) => {
                // getting user data from google: 
                const newUser = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value
                }

                // finding the user in the database: 
                try {
                    let user = await User.findOne({ googleId: profile.id })
                    // let user = await User.findOne({ email: profile.emails[0].value })


                    if (user) {
                        done(null, user)
                    } else {
                        user = await User.create(newUser)
                        done(null, user)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        )
    )

    passport.serializeUser((user, done) => {
        done(null, user.id)
        // done(null, user.email)

    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}    