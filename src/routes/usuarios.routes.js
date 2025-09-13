const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarios.controller');
const { authorization, rolesPermitidos } = require('../middleware/authorization'); // 🔐 Middleware JWT + Roles

// ========== RUTAS PÚBLICAS ==========
router.post('/login', usuarioController.loginUsuario); // Login público

// ========== RUTAS PROTEGIDAS ==========

// Crear usuario → Solo ADMIN
router.post('/', authorization, rolesPermitidos(1), usuarioController.crearUsuario);

// Perfil del usuario logueado (cualquier usuario autenticado)
router.get('/perfil/me', authorization, usuarioController.perfilUsuario);

// CRUD de usuarios (solo ADMIN)
router.get('/', authorization, rolesPermitidos(1), usuarioController.obtenerUsuarios);
router.get('/:id', authorization, rolesPermitidos(1), usuarioController.obtenerUsuario);
router.put('/:id', authorization, rolesPermitidos(1), usuarioController.actualizarUsuario);
router.delete('/:id', authorization, rolesPermitidos(1), usuarioController.eliminarUsuario);


module.exports = router;