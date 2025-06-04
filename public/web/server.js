// Archivo: /home/antina/public/web/server.js

const express = require('express');
const { MongoClient } = require('mongodb'); // Importar el driver de MongoDB

const app = express();
const PORT = process.env.PORT || 4001;

// --- Configuración de la Conexión a MongoDB ---
// IMPORTANTE: Reemplaza TU_CONTRASEÑA_AQUI con la contraseña real de tu usuario "Yaku".
// ¡Considera usar variables de entorno para la contraseña en un entorno de producción real!
const mongoUser = "Yaku"; // Tu usuario de MongoDB
const mongoPass = "Yaku24kk"; // ¡CAMBIA ESTO POR TU CONTRASEÑA REAL!
const mongoUrl = `mongodb://${mongoUser}:${mongoPass}@127.0.0.1:27017/?authSource=admin&retryWrites=true&w=majority`;
// Nota: he añadido retryWrites=true&w=majority a la URI, son opciones comunes y recomendadas.

const dbName = 'antina_db'; // El nombre de tu base de datos
const collectionName = 'abonados'; // El nombre de tu colección

let db; // Variable para mantener la referencia a la base de datos

// Función para conectar a MongoDB y crear índices
async function connectToMongoDB() {
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        db = client.db(dbName);
        console.log(`[INFO] Conectado exitosamente a MongoDB: ${dbName}`);

        // --- Crear un índice en el campo DNI para búsquedas rápidas ---
        // Esto solo necesita hacerse una vez, pero es seguro ejecutarlo cada vez que la app inicia.
        // MongoDB es lo suficientemente inteligente para no recrearlo si ya existe.
        // Asegúrate de que 'numdoc' (o 'Dni') sea el campo correcto.
        const abonadosCollection = db.collection(collectionName);
        // Comprueba si el campo DNI en tus documentos es 'numdoc' o 'Dni'
        await abonadosCollection.createIndex({ numdoc: 1 }); 
        // Si a veces usas 'Dni' (con D mayúscula) y a veces 'numdoc',
        // sería bueno estandarizar a uno o indexar ambos si es necesario.
        // Por ejemplo, si 'Dni' también se usa: await abonadosCollection.createIndex({ Dni: 1 });
        console.log(`[INFO] Índice asegurado/creado en '${collectionName}' para el campo 'numdoc'.`);

    } catch (error) {
        console.error('[ERROR] No se pudo conectar a MongoDB o crear el índice:', error);
        console.error('[ERROR] Asegúrate de que MongoDB esté corriendo y la URI de conexión (incluyendo usuario y contraseña) sea correcta.');
        // Si no podemos conectar a la DB, la API no funcionará. Podríamos terminar el proceso.
        process.exit(1); // Termina la aplicación si no puede conectar a la DB
    }
}

// --- Middlewares (si los necesitas) ---
app.use(express.json()); // Para parsear cuerpos de solicitud JSON (para POST, PUT)
app.use(express.urlencoded({ extended: true })); // Para parsear cuerpos de solicitud URL-encoded

// --- Endpoint de la API de Consulta (Ahora usando MongoDB) ---
// URL: GET https://actualizar.antina.digital/api/abonado?dni=12345678
app.get('/api/abonado', async (req, res) => { // La función del endpoint ahora es async
    const dniBuscado = req.query.dni;

    if (!db) { // Verificar si la conexión a la DB está disponible
        console.error("[ERROR] Solicitud a /api/abonado pero no hay conexión a la base de datos.");
        return res.status(503).json({ error: 'Servicio no disponible: No hay conexión a la base de datos.' });
    }

    if (!dniBuscado) {
        return res.status(400).json({ error: 'DNI no proporcionado. Use el parámetro de consulta ?dni=NUMERO' });
    }

    const dniNumero = parseInt(dniBuscado, 10);
    if (isNaN(dniNumero)) {
        return res.status(400).json({ error: 'El DNI proporcionado no es un número válido.' });
    }

    try {
        const abonadosCollection = db.collection(collectionName);
        // Buscar el abonado usando el campo DNI.
        // Asegúrate de que 'numdoc' sea el campo correcto donde guardaste el DNI como número.
        const abonadoEncontrado = await abonadosCollection.findOne({ numdoc: dniNumero });
        
        // Si tuvieras DNIs almacenados como 'Dni' (con mayúscula) y quisieras buscar en ambos:
        // const abonadoEncontrado = await abonadosCollection.findOne({ $or: [{ numdoc: dniNumero }, { Dni: dniNumero }] });

        if (abonadoEncontrado) {
            res.json(abonadoEncontrado);
        } else {
            res.status(404).json({ mensaje: 'Abonado no encontrado.', dni_consultado: dniBuscado });
        }
    } catch (error) {
        console.error(`[ERROR] Al buscar DNI ${dniBuscado} en MongoDB:`, error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la solicitud.' });
    }
});

// --- Endpoint Raíz (Opcional) ---
// Para verificar rápidamente si la API está online
app.get('/', (req, res) => {
    res.send('API de Antina Digital (conectada a MongoDB) está activa. Acceda a /api/abonado?dni=NUMERO para realizar consultas.');
});

// --- Iniciar el Servidor y Conectar a MongoDB ---
async function iniciarServidor() {
    await connectToMongoDB(); // Esperar a que la conexión a la DB se establezca

    app.listen(PORT, () => {
        console.log(`[INFO] Servidor API de Antina Digital (MongoDB) escuchando en http://localhost:${PORT}`);
    });
}

iniciarServidor(); // Llamar a la función asíncrona para iniciar
