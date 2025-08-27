// Middlewares de autenticación/autorización (ESQUELETO)
const jwt = require('jsonwebtoken');


// Verifica que el token JWT sea válido
const proteger = (req, res, next) => {
// TODO: leer Authorization: Bearer <token>, verificar y adjuntar usuario a req.user
return res.status(501).json({ ok: false, message: 'proteger (auth) no implementado aún' });
};


// Restringe por roles: Administrador, Contador, Empleado
const autorizar = (...rolesPermitidos) => {
return (req, res, next) => {
// TODO: si req.user.rol no está en rolesPermitidos => 403
return res.status(501).json({ ok: false, message: 'autorizar (roles) no implementado aún' });
};
};


module.exports = { proteger, autorizar };