
// Lógica de negocio del CRUD de usuarios (ESQUELETO)
// NOTA: aquí irán las consultas a PostgreSQL usando el pool
const { pool } = require('../config');


// Crear usuario
const crearUsuario = async (req, res) => {
// TODO: validar body, encriptar password, insertar en BD
return res.status(501).json({ ok: false, message: 'crearUsuario no implementado aún' });
};


// Listar usuarios (paginado opcional)
const listarUsuarios = async (req, res) => {
// TODO: SELECT * FROM usuarios ORDER BY idusuario DESC
return res.status(501).json({ ok: false, message: 'listarUsuarios no implementado aún' });
};


// Obtener usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
// TODO: SELECT por :id, manejar 404 si no existe
return res.status(501).json({ ok: false, message: 'obtenerUsuarioPorId no implementado aún' });
};


// Actualizar usuario
const actualizarUsuario = async (req, res) => {
// TODO: validar body, actualizar campos permitidos, manejar 404
return res.status(501).json({ ok: false, message: 'actualizarUsuario no implementado aún' });
};


// Eliminar/Desactivar usuario
const eliminarUsuario = async (req, res) => {
// TODO: eliminación lógica (estado=false) o física según tu diseño
return res.status(501).json({ ok: false, message: 'eliminarUsuario no implementado aún' });
};


module.exports = {
crearUsuario,
listarUsuarios,
obtenerUsuarioPorId,
actualizarUsuario,
eliminarUsuario
};