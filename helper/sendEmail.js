const Agenda = require("agenda");
const nodemailer = require('nodemailer');
require('dotenv').config();

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
    const { toSender, emailSubject, messageContent } = job.attrs.data;

    try {
        const message = {
            from: process.env.EMAIL,
            to: toSender,
            subject: emailSubject,
            text: messageContent,
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

