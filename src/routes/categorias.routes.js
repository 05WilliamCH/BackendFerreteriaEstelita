const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categorias.controller');

// =======================
// RUTAS DE CATEGORÍAS
// =======================

// Crear categoría
router.post('/', categoriaController.crearCategoria);

// Obtener todas las categorías
router.get('/', categoriaController.obtenerCategorias);

// Obtener categoría por ID
router.get('/:id', categoriaController.obtenerCategoria);

// Actualizar categoría
router.put('/:id', categoriaController.actualizarCategoria);

// Eliminar categoría
router.delete('/:id', categoriaController.eliminarCategoria);

module.exports = router;
