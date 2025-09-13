const express = require("express");
const router = express.Router();
const {
  obtenerCompras,
  obtenerCompra,
  crearCompra
} = require("../controllers/compra.controller");

// Rutas
router.get("/", obtenerCompras);          // Listar todas las compras
router.get("/:id", obtenerCompra);        // Obtener compra por ID
router.post("/", crearCompra);            // Crear compra con detalles

module.exports = router;
