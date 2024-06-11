const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const MONGODB_URL = process.env.DB_URL;
const ticketRoute = require("./routes/ticketRoutes.js")
const userRoute = require("./routes/userRoutes.js");
const passport = require("passport");
const session = require("express-session");



const PORT = process.env.PORT || 3000;


// Initialize the express app: 
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors());

app.use(bodyParser.json());

app.use(express.static('public'))
app.set('view engine', 'ejs')


// initializing middleware: 
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
)
// passport middleware: 
require("./config/passport.js")(passport);
app.use(passport.initialize())
app.use(passport.session())




app.use("/api/dashboard", userRoute);

app.use("/api/ticket", ticketRoute);



// SERVER SETUP:
const server = app.listen(PORT, console.log(`Server is running on port ${PORT}`));

// CONNECTING MONGODB:
mongoose.connect(MONGODB_URL).then(() => {
    console.log("DATABASE CONNECTED!!")
}).catch((err) => console.log(err));

