const express = require("express");
const router = express.Router();
const { obtenerDetalleVenta } = require("../controllers/ventaDetalle.controller");

router.get("/detalle/:codigo", obtenerDetalleVenta); // Ejemplo: /api/ventas/12345 o /api/ventas/FACT-001

module.exports = router;
