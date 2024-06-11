// const Queue = require('bull');
// const sendMail = require('./sendMail');

// const emailQueue = new Queue('email', {
//     redis: {
//         host: '127.0.0.1',
//         port: 6379,
//         tls: true,
//         enableTLSForSentinelMode: false
//     }
// });

// emailQueue.process(async (job) => {
//     const { to, subject, text } = job.data;
//     try {
//         await sendMail(to, subject, text);
//         console.log("Email sent successfully!");
//     } catch (error) {
//         console.error("Error sending email:", error);
//         throw error;
//     }
// });

// module.exports = emailQueue;
