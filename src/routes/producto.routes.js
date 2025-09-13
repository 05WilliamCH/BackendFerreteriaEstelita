const express = require("express");
const router = express.Router();
const {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require("../controllers/producto.controller");

// Rutas
router.get("/", obtenerProductos);
router.get("/:id", obtenerProducto);
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

module.exports = router;
