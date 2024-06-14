// const nodemailer = require("nodemailer");


// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//     }
// });

// async function sendMail({ to, subject, text }) {
//     const mailOptions = {
//         from: process.env.EMAIL,
//         to,
//         subject,
//         text
//     };

//     // await transporter.sendMail(mailOptions);
//     try {
//         let info = await transporter.sendMail(mailOptions);
//         console.log('Message sent:', info.messageId);
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// }

// module.exports = sendMail;