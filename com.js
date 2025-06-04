const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TELEGRAM_TOKEN = '7910034589:AAEXvaZYUShtN64u-3OJPkt-ZVC5EJCQY3I';
const TELEGRAM_CHAT_ID = '7375672305';
const ARCHIVO = path.join(__dirname, 'comentarios.txt');

let lineasPrevias = [];

function enviarTelegram(mensaje) {
    return axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: mensaje,
        parse_mode: 'HTML'
    }).catch(err => {
        console.error('Error al enviar mensaje a Telegram:', err.message);
    });
}

function procesarNuevosComentarios() {
    fs.readFile(ARCHIVO, 'utf8', async (err, contenido) => {
        if (err) return console.error('Error leyendo comentarios.txt:', err);

        const lineas = contenido.split('\n');

        if (lineas.length > lineasPrevias.length) {
            const nuevasLineas = lineas.slice(lineasPrevias.length);
            let comentario = '';

            for (const linea of nuevasLineas) {
                if (linea.startsWith('--- Comentario desde IP:')) {
                    if (comentario) {
                        await enviarTelegram(comentario.trim());
                    }
                    comentario = linea + '\n';
                } else {
                    comentario += linea + '\n';
                }
            }

            if (comentario) {
                await enviarTelegram(comentario.trim());
            }

            lineasPrevias = lineas;
        }
    });
}

function iniciarVigilancia() {
    if (!fs.existsSync(ARCHIVO)) {
        console.log('comentarios.txt no encontrado. Esperando a que sea creado...');
    }

    // Inicializar lineasPrevias si el archivo ya existe
    try {
        const contenido = fs.readFileSync(ARCHIVO, 'utf8');
        lineasPrevias = contenido.split('\n');
    } catch (e) {
        lineasPrevias = [];
    }

    setInterval(procesarNuevosComentarios, 1000); // cada 1 segundo
    console.log('⏳ Vigilando comentarios.txt cada 1 segundo...');
}

iniciarVigilancia();
