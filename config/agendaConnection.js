const Agenda = require("agenda")
require('dotenv').config();

const connectionString = process.env.DB_URL

if (!connectionString) {
    throw new Error('DB_URL environment variable is not set.');
}

const agenda = new Agenda({
    db: {
        address: connectionString,
        collection: 'emailJobs'
    }
})

// (async function () {
//     await agenda.start();
// })();


agenda.on('ready', () => console.log('Agenda started!'));

agenda.on('error', (error) => {
    console.error('Agenda connection error:', error);
});

(async () => {
    try {
        await agenda.start();
    } catch (error) {
        console.error('Agenda start error:', error);
    }
})();

module.exports = agenda;

