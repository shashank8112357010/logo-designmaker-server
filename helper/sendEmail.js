const Agenda = require("agenda");
const nodemailer = require('nodemailer');
require('dotenv').config();
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const User = require("../models/userModel");
const { resetPasswordTemplate } = require("../views/resetPasswordMailTemplate");

const connectionString = process.env.DB_URL;
if (!connectionString) {
    throw new Error('DB_URL environment variable is not set.');
}
const agenda = new Agenda({
    db: {
        address: connectionString,
        collection: 'emailJobs'
    }
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    }
})

// Define the job handler (registration mail):
agenda.define('sendRegisterMail', async (job) => {
    // const { toSender, emailSubject, messageContent } = job.attrs.data;
    const { toSender, emailSubject, htmlToSend } = job.attrs.data;
    try {
        const message = {
            from: process.env.EMAIL,
            to: toSender,
            subject: emailSubject,
            // text: messageContent,
            html: htmlToSend
        };
        await transporter.sendMail(message);
        console.log("Email for registration sent successfully");
    } catch (error) {
        console.error('Error sending registration email:', error);
        throw new Error("Email could not be sent");
    }
});

// Defining function to send otp: 
agenda.define('sendOTPMail', async (job) => {
    const { toSender, emailSubject, messageContent } = job.attrs.data;
    try {
        const message = {
            from: process.env.EMAIL,
            to: toSender,
            subject: emailSubject,
            text: messageContent,
        };

        await transporter.sendMail(message);
        console.log("Email for OTP sent successfully");
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error("Email could not be sent");
    }
})

agenda.define('sendResetPasswordLink', async (job) => {
    const { toSender, emailSubject, htmlToSend } = job.attrs.data;

    try {
        const message = {
            from: process.env.EMAIL,
            to: toSender,
            subject: emailSubject,
            // text: messageContent,
            html: htmlToSend
        };
        await transporter.sendMail(message);
        console.log("Email for password reset link sent successfully");
    } catch (error) {
        console.error('Error sending Reset Password Link email:', error);
        throw new Error("Email could not be sent");
    }
})

const templatePath_1 = path.join(__dirname, '../views', 'greetingEmailMorning.ejs');
const templateSource_1 = fs.readFileSync(templatePath_1, 'utf8');

const templatePath_2 = path.join(__dirname, '../views', 'greetingEmailEvening.ejs');
const templateSource_2 = fs.readFileSync(templatePath_2, 'utf8');

// mail to be sent in morning: 
agenda.define("greetingMail_morning", async (job) => {
    const { emailSubject } = job.attrs.data;

    try {
        const users = await User.find({ mailAllow: true });
        for (let user of users) {
            const personalisedMsg = `Good morning, ${user.username}.. have a great day!!`
            const toSender = user.workEmail;
            const htmlToSend = ejs.render(templateSource_1, { username: user.username, message: personalisedMsg });

            const message = {
                from: process.env.EMAIL,
                to: toSender,
                subject: emailSubject,
                // text: messageContent,
                html: htmlToSend,
            }
            await transporter.sendMail(message);
            console.log("Email for morning greeting sent successfully");
        }
    } catch (error) {
        console.error('Error sending morning greeting:', error);
        throw new Error("Email could not be sent");
    }
})

agenda.define("greetingMail_evening", async (job) => {
    const { emailSubject } = job.attrs.data;

    try {
        const users = await User.find({ mailAllow: true });
        for (let user of users) {
            const personalisedMsg = `Good evening, ${user.username}.. Hope you had a great day\n\nLorem ipsum dolor sit amet, consectetur adipisicing elit. Eius saepe incidunt aut voluptatibus quam inventore placeat quia voluptas? Debitis, temporibus.\nLorem ipsum dolor sit amet, consectetur adipisicing elit. Eius saepe incidunt aut voluptatibus quam inventore placeat quia voluptas? Debitis, temporibus.`
            const toSender = user.workEmail;
            const htmlToSend = ejs.render(templateSource_2, { username: user.username, message: personalisedMsg });

            const message = {
                from: process.env.EMAIL,
                to: toSender,
                subject: emailSubject,
                // text: messageContent,
                html: htmlToSend,
            }
            await transporter.sendMail(message);
            console.log("Email for evening greeting sent successfully");
        }
    } catch (error) {
        console.error('Error sending evening greeting email:', error);
        throw new Error("Email could not be sent");
    }
})


// Event handlers for Agenda
agenda.on('ready', () => {
    console.log('Agenda started!');
    agenda.start(); // Start Agenda processing after it's ready
});

agenda.on('error', (error) => {
    console.error('Agenda connection error:', error);
    throw new Error("Agenda connection error");
});


module.exports = agenda;

