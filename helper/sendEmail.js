const Agenda = require("agenda");
const nodemailer = require('nodemailer');
require('dotenv').config();
const { MongoClient } = require("mongodb")

const connectionString = process.env.DB_URL;
if (!connectionString) {
    throw new Error('DB_URL environment variable is not set.');
}
const agenda = new Agenda({
    db: {
        address: connectionString,
        collection: 'emailJobs',
    },
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
            html: htmlToSend,
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
    // const { toSender, emailSubject, messageContent } = job.attrs.data;
    const { toSender, emailSubject, htmlToSend } = job.attrs.data;
    try {
        const message = {
            from: process.env.EMAIL,
            to: toSender,
            subject: emailSubject,
            // text: messageContent,
            html: htmlToSend,
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
            html: htmlToSend,

        };
        await transporter.sendMail(message);
        console.log("Email for password reset link sent successfully");
    } catch (error) {
        console.error('Error sending Reset Password Link email:', error);
        throw new Error("Email could not be sent");
    }
})


async function removeFinishedJobs() {
    const client = new MongoClient(connectionString);

    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('emailJobs');

        const result = await collection.deleteMany({
            $and: [
                { lastFinishedAt: { $ne: null } }, // Job has finished
            ]
        });

        console.log(`Removed ${result.deletedCount} finished job(s)`);

    } catch (error) {
        console.error('Error finding finished jobs:', error);
        throw new Error('Failed to find finished jobs');
    }
}

agenda.define('removeFinishedJobs', async (job) => {
    try {
        await removeFinishedJobs();
    } catch (error) {
        console.error('Error running removeFinishedJobs:', error);
    }
});


// Event handlers for Agenda
agenda.on('ready', () => {
    console.log('Agenda started!');

    // Define how often the job should run 
    agenda.every('12 hours', 'removeFinishedJobs');

    agenda.start(); // Start Agenda processing after it's ready

});

agenda.on('error', (error) => {
    console.error('Agenda connection error:', error);
    throw new Error("Agenda connection error");
});

module.exports = agenda;