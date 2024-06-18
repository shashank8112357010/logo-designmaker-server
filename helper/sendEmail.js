// using agenda:

// const {ObjectId} = require('mongodb');
const nodemailer = require('nodemailer');
const agenda = require("../config/agendaConnection");



// Defined sendRegisterMail: 
agenda.define('sendRegisterMail', async (job) => {
    const { toSender, emailSubject, messageContent } = job.attrs.data;

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            }
        })
        const message = {
            from: process.env.EMAIL,
            to: toSender,
            subject: emailSubject,
            text: messageContent,
        }

        await transporter.sendMail(message);
        console.log("Email sent successfully")
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error("Email could not be sent");
    }
})