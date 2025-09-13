const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clientes.controller');

// CRUD clientes
router.get('/', clienteController.obtenerClientes);
router.post('/', clienteController.crearCliente);
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.eliminarCliente);

module.exports = router;
