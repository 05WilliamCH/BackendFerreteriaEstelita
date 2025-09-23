const express = require("express");
const router = express.Router();
const productoController = require("../controllers/producto.controller");

router.get("/", productoController.obtenerProductos);
router.post("/", productoController.crearProducto);
router.put("/:id", productoController.actualizarProducto);
router.delete("/:id", productoController.eliminarProducto);

module.exports = router;
