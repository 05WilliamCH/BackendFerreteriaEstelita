const express = require("express");
const router = express.Router();
const productoController = require("../controllers/producto.controller");

router.get("/", productoController.obtenerProductos);
router.post("/", productoController.crearProducto);
router.put("/:id", productoController.actualizarProducto);
router.delete("/:id", productoController.eliminarProducto);

// ruta para buscar producto por código
router.get("/codigo/:codigo", productoController.obtenerProductoPorCodigo);
router.get("/buscar", productoController.buscarProductoPorNombre); // Buscar producto por nombre (autocompletar)

// RUTA en productRoutes.js
router.put("/producto/:id/precio", productoController.actualizarPrecioVenta);



module.exports = router;
