const properties = {
    component_id: 'chatDB',
}

const Ollama = require('ollama');

let meushi = null;
let activeDB = null;
let brainDB = null;
let memDB = null;

async function updateChunk (message) {
        await memDB.memorizeText(message);
}

async function getMessages(query, user = undefined) {
    const start = process.hrtime();
    let rows = await memDB.queryMemory(query, 1);
    const end = process.hrtime(start);
    meushi.log(`Took ${end[0]} seconds and ${end[1] / 1000000} milliseconds to queryDB.`);

    return rows;
}

function setupDB() {
    const dbName = `chat.db`;
    activeDB = new (meushi.components.retrieveExecutable('dbManager'))(dbName);
    activeDB.addSetupScript(`
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY,
            date TEXT,
            time TEXT,
            username TEXT,
            message TEXT
    )`);

    activeDB.addSetupScript(`
        CREATE TABLE IF NOT EXISTS server_messages (
            id INTEGER PRIMARY KEY,
            date TEXT,
            time TEXT,
            message TEXT
    )`);

    activeDB.init();
}

function init(source) {
    meushi = source;
    brainDB = meushi.components.retrieveExecutable('brainDB');
    memDB = new brainDB('smart_chat', 'http://127.0.0.1:11434', 'nomic-embed-text');

    // The local DB may be redundant...
    setupDB();

    meushi.bot.on('message', async (message, pos, sender, ver, src = source) => {
        const msg = src.parseMessage(message);
        const time = new Date().toISOString();

        const date = time.split('T')[0];
        const [year, month, day] = date.split('-');

        const dateFormatted = `${month}-${day}-${year}`;
        const timeFormatted = time.split('T')[1]

        const formattedMessage = `[${meushi.config.auth.host}][${dateFormatted} ${timeFormatted}] ${sender}: ${message}`;

        // Needs a more appropriate name.
        updateChunk(formattedMessage);
        
        let dbCommand = null;
        let values = [];

        if(msg.username === 'server') {
            dbCommand = `INSERT INTO server_messages (date, time, message) VALUES (?, ?, ?)`;
            values = [dateFormatted, timeFormatted, msg.message];
        } else {
            dbCommand = `INSERT INTO chat_history (date, time, username, message) VALUES (?, ?, ?, ?)`;
            values = [dateFormatted, timeFormatted, msg.username, msg.message];
        }

        activeDB.prepare(dbCommand).run(values);
    });
}


module.exports = {
    properties: properties,
    init: init,
    executable: getMessages,
}
