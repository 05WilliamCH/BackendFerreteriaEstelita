const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compra.controller");

router.get("/", compraController.obtenerCompras);
router.post("/", compraController.crearCompra);

module.exports = router;
