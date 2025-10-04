const express = require("express");
const router = express.Router();
const ventaController = require("../controllers/ventas.controller");

// ========================
// RUTAS DE VENTAS
// ========================
router.post("/", ventaController.crearVenta);           // Crear venta
router.get("/", ventaController.obtenerVentas);         // Obtener todas las ventas
router.get("/:id/detalle", ventaController.obtenerDetalleVenta); // Obtener detalle de una venta específica

module.exports = router;
