const express = require("express");
const router = express.Router();
const devolucionVentaController = require("../controllers/devolucionVenta.controller");

// Crear devolución de venta
router.post("/", devolucionVentaController.crearDevolucionVenta);

// Obtener todas las devoluciones de venta
router.get("/", devolucionVentaController.obtenerDevolucionesVenta);

// Obtener devolución de venta por ID
router.get("/:id", devolucionVentaController.obtenerDevolucionVentaPorId);

router.get("/numero/:numerofactura", devolucionVentaController.obtenerVentaPorNumero);

module.exports = router;
