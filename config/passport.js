
const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/userModel");


// module.exports = function (passport) {
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: 'http://localhost:4000/api/dashboard/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, emails } = profile;
                const workEmail = emails[0].value;

                if (!workEmail) {
                    throw new Error("Google does not provide an email address");
                }

                // finding or creating user: 
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
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
})
// }    