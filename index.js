const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const MONGODB_URL = process.env.DB_URL;
const ticketRoute = require("./routes/ticketRoutes.js");
const userRoute = require("./routes/userRoutes.js");
const serviceRoute = require("./routes/serviceRoutes.js");
const transactionRoute = require("./routes/transactionRoutes.js");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;

// Initialize the express app: 
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cookieParser());

app.use(bodyParser.json());

app.use(express.static('public'));
app.set('view engine', 'ejs');

// initializing middleware: 
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        }
    })
);

// passport middleware: 
require("./config/passport.js");
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/dashboard", userRoute);
app.use("/api/ticket", ticketRoute);
app.use("/api/dashboard/service", serviceRoute);
app.use("/api/dashboard/transaction", transactionRoute);

// SERVER SETUP:
const server = app.listen(PORT, console.log(`Server is running on port ${PORT}`));

// CONNECTING MONGODB:
mongoose.connect(MONGODB_URL).then(() => {
    console.log("DATABASE CONNECTED!!")
}).catch((err) => console.log(err));


// unexpected error handling 
process.on("uncaughtException", (err) => {
    console.log(`Logged Error from index js: ${err.stack}`);
    server.close(() => process.exit(1));
})

