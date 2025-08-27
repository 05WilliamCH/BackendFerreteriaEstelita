const express = require('express');
const router = express.Router();


const {
crearUsuario,
listarUsuarios,
obtenerUsuarioPorId,
actualizarUsuario,
eliminarUsuario
} = require('../controllers/usuarioController');


// const { proteger, autorizar } = require('../middleware/authMiddleware');


// Rutas CRUD (puedes habilitar proteger/autorizar cuando implementes auth)
router.post('/', /*proteger, autorizar('Administrador'),*/ crearUsuario);
router.get('/', /*proteger, autorizar('Administrador', 'Contador'),*/ listarUsuarios);
router.get('/:id', /*proteger, autorizar('Administrador', 'Contador'),*/ obtenerUsuarioPorId);
router.put('/:id', /*proteger, autorizar('Administrador'),*/ actualizarUsuario);
router.delete('/:id', /*proteger, autorizar('Administrador'),*/ eliminarUsuario);


module.exports = router;