const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compra.controller");

router.get("/", compraController.obtenerCompras);       // Obtener todas las compras
router.post("/", compraController.crearCompra);         // Crear nueva compra
router.put("/:idcompra", compraController.editarCompra); // Editar compra existente

module.exports = router;
