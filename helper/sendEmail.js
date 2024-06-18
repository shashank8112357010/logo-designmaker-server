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

// Define the job handler
agenda.define('sendRegisterMail', async (job) => {
    const { toSender, emailSubject, messageContent } = job.attrs.data;

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            }
        });

        const message = {
            from: process.env.EMAIL,
            to: toSender,
            subject: emailSubject,
            text: messageContent,
        };

        await transporter.sendMail(message);
        console.log("Email sent successfully");
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error("Email could not be sent");
    }
});

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

