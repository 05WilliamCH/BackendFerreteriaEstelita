// devolucionCompra.routes.js
const express = require("express");
const router = express.Router();
const devolucionCompraController = require("../controllers/devolucionCompra.controller");

router.get("/productos/:numerocompra", devolucionCompraController.obtenerProductosPorNumeroCompra);
router.post("/", devolucionCompraController.crearDevolucionSegura);

module.exports = router;
