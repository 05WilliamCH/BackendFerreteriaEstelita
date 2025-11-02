const express = require("express");
const router = express.Router();
const { obtenerDetalleCompra } = require("../controllers/compraDetalle.controller");

router.get("/detalle/:codigo", obtenerDetalleCompra); // Ejemplo: /api/compras/12345 o /api/compras/COMP-20251102-0002

module.exports = router;
