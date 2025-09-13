const express = require("express");
const router = express.Router();

const devolucionesController = require("../controllers/devoluciones.controller");

// =======================
// RUTAS DEVOLUCIONES
// =======================

// Crear una devolución
router.post("/", devolucionesController.crearDevolucion);

// Obtener todas las devoluciones
router.get("/", devolucionesController.obtenerDevoluciones);

// Obtener una devolución por ID
router.get("/:id", devolucionesController.obtenerDevolucion);

// Actualizar una devolución por ID
router.put("/:id", devolucionesController.actualizarDevolucion);

// Eliminar una devolución por ID
router.delete("/:id", devolucionesController.eliminarDevolucion);

module.exports = router;
//     console.error("Error al obtener categoría:", error.message);