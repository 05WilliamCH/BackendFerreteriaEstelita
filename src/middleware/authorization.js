const jwt = require("jsonwebtoken");

// Middleware para validar token y extraer usuario
const authorization = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.header("x-auth-token");

  if (!token) return res.status(401).json({ error: "Acceso denegado, token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret || process.env.JWT_SECRET);
    req.usuario = { idusuario: decoded.idusuario, idrol: decoded.idrol };
    next();
  } catch (err) {
    console.error("Error token:", err.message);
    res.status(401).json({ error: "Token no válido" });
  }
};

// Middleware para roles específicos
const rolesPermitidos = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: "Usuario no autenticado" });
    if (!roles.includes(req.usuario.idrol)) {
      return res.status(403).json({ error: "Acceso denegado: rol no autorizado" });
    }
    next();
  };
};

module.exports = { authorization, rolesPermitidos };
