// Sending email using bull and redis: 
const Queue = require('bull');
const nodemailer = require("nodemailer");

const emailQueue = new Queue('email', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
        tls: true,
        enableTLSForSentinelMode: false
    }
});

let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

emailQueue.process(async (job) => {
    const { to, subject, text } = job.data;
    try {
        await sendMail(to, subject, text);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
});

async function sendMail(to, subject, text) {

    console.log(to, "to------");
    let mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    }

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return info;
    } catch (error) {
        console.log("Error sending mail: ", error);
        throw error;
    }
}

const sendOTPMail = async (to, subject, text) => {
    let mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    }

    try {
        let info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.log("Error sending mail: ", error);
        throw error;
    }
}

module.exports = { emailQueue, sendMail, sendOTPMail };
