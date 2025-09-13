const pool = require("../db");

// =======================
// CREAR PROVEEDOR
// =======================
exports.crearProveedor = async (req, res) => {
  try {
    const { nombre, telefono, direccion, email, nit } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre del proveedor es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO proveedor (nombre, telefono, direccion, email, nit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING idprov, nombre, telefono, direccion, email, nit, fechacreacion`,
      [nombre, telefono, direccion, email, nit]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear proveedor:", error.message);
    res.status(500).json({ error: "Error al crear proveedor" });
  }
};

// =======================
// OBTENER TODOS LOS PROVEEDORES
// =======================
exports.obtenerProveedores = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT idprov, nombre, telefono, direccion, email, nit, fechacreacion 
       FROM proveedor ORDER BY idprov ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error.message);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
};

// =======================
// OBTENER PROVEEDOR POR ID
// =======================
exports.obtenerProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT idprov, nombre, telefono, direccion, email, nit, fechacreacion 
       FROM proveedor WHERE idprov=$1`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Proveedor no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener proveedor:", error.message);
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
};

// =======================
// ACTUALIZAR PROVEEDOR
// =======================
exports.actualizarProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion, email, nit } = req.body;

  try {
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre del proveedor es obligatorio" });
    }

    const result = await pool.query(
      `UPDATE proveedor
       SET nombre=$1, telefono=$2, direccion=$3, email=$4, nit=$5
       WHERE idprov=$6
       RETURNING idprov, nombre, telefono, direccion, email, nit, fechacreacion`,
      [nombre, telefono, direccion, email, nit, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Proveedor no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar proveedor:", error.message);
    res.status(500).json({ error: "Error al actualizar proveedor" });
  }
};

// =======================
// ELIMINAR PROVEEDOR
// =======================
exports.eliminarProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM proveedor WHERE idprov=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Proveedor no encontrado" });

    res.json({ mensaje: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error.message);
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
};
