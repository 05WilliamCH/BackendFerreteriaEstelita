const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// =======================
// REGISTRAR USUARIO
// =======================
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, telefono, email, password, idrol, estado } = req.body;

    // Validar correo Gmail
    if (!validator.isEmail(email) || !email.endsWith("@gmail.com")) {
      return res.status(400).json({ error: "Solo se permiten correos Gmail válidos" });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await pool.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: "Usuario ya registrado" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Guardar usuario en DB
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuario (nombre, telefono, email, usuario_password, idrol, estado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING idusuario, nombre, email, telefono, idrol, estado`,
      [nombre, telefono, email, hashedPassword, idrol, estado]
    );

    res.status(201).json({ usuario: nuevoUsuario.rows[0] });
  } catch (error) {
    console.error("Error al crear usuario:", error.message);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// =======================
// LOGIN USUARIO
// =======================
exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar existencia del usuario
    const usuario = await pool.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );
    if (usuario.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Comparar contraseña
    const validPassword = await bcrypt.compare(password, usuario.rows[0].usuario_password);
    if (!validPassword) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { idusuario: usuario.rows[0].idusuario, idrol: usuario.rows[0].idrol },
      process.env.jwtSecret,
      { expiresIn: "1h" }
    );

    res.json({ token, usuario: { idusuario: usuario.rows[0].idusuario, nombre: usuario.rows[0].nombre, email: usuario.rows[0].email, idrol: usuario.rows[0].idrol } });
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// =======================
// PERFIL DEL USUARIO LOGUEADO
// =======================
exports.perfilUsuario = async (req, res) => {
  try {
    const { idusuario } = req.usuario; // viene del middleware authorization
    const result = await pool.query(
      'SELECT idusuario, nombre, telefono, email, idrol, estado FROM usuario WHERE idusuario = $1',
      [idusuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({ error: 'Error al obtener perfil del usuario' });
  }
};

// =======================
// OBTENER TODOS LOS USUARIOS
// =======================
exports.obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT idusuario, nombre, telefono, email, idrol, estado, fechacreacion FROM usuario ORDER BY idusuario ASC');
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// =======================
// OBTENER USUARIO POR ID
// =======================
exports.obtenerUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT idusuario, nombre, telefono, email, idrol, estado, fechacreacion FROM usuario WHERE idusuario = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// =======================
// ACTUALIZAR USUARIO
// =======================
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, password, idrol, estado } = req.body;

  try {
    let query;
    let values;

    if (password && password.trim() !== "") {
      // Si se envía nueva contraseña, la encriptamos
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      query = `
        UPDATE usuario
        SET nombre=$1, telefono=$2, email=$3, usuario_password=$4, idrol=$5, estado=$6
        WHERE idusuario=$7
        RETURNING idusuario, nombre, telefono, email, idrol, estado
      `;
      values = [nombre, telefono, email, hashedPassword, idrol, estado, id];
    } else {
      // Si no se envía contraseña, no la actualizamos
      query = `
        UPDATE usuario
        SET nombre=$1, telefono=$2, email=$3, idrol=$4, estado=$5
        WHERE idusuario=$6
        RETURNING idusuario, nombre, telefono, email, idrol, estado
      `;
      values = [nombre, telefono, email, idrol, estado, id];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};


// =======================
// ELIMINAR USUARIO
// =======================
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuario WHERE idusuario = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

