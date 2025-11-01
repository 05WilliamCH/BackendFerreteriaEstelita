// routes/inventarioRoutes.js
const express = require("express");
const router = express.Router();
const { obtenerResumenInventario } = require("../controllers/invdashboard.controller");

// Ruta para el dashboard de inventario
router.get("/", obtenerResumenInventario);

module.exports = router;
