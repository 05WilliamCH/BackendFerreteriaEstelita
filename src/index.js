const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());


// Rutas
const usuarioRoutes = require('../src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);


// Healthcheck
app.get('/api/health', (req, res) => {
res.json({ ok: true, status: 'UP', timestamp: new Date().toISOString() });
});


// Manejo básico de 404
app.use((req, res, next) => {
res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});


// Manejo básico de errores
app.use((err, req, res, next) => {
console.error(err);
res.status(err.status || 500).json({ ok: false, message: err.message || 'Error interno del servidor' });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
console.log(`Servidor escuchando en puerto ${PORT}`);
});