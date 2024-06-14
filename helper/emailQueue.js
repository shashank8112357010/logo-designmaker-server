// const Queue = require("bull");
// const sendMail = require("./sendMail");

// const emailQueue = new Queue('email', {
//     redis: {
//         host: '127.0.0.1',
//         port: 6379,
//         // tls: true,
//         // enableTLSForSentinelMode: false,
//         // maxRetriesPerRequest: 100
//     }
// });

// emailQueue.process(async (job) => {
//     const { to, subject, text } = job.data;
//     console.log('Processing job: ', job.id, job.data);
//     try {
//         await sendMail(to, subject, text);
//         console.log(`email sent to ${job.data.to}`)
//     } catch (error) {
//         console.log("Error sending email..", error);
//     }
// })

// module.exports = emailQueue;