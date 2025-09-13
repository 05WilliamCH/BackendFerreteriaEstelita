const pool = require("../db");

// =======================
// CREAR CATEGORÍA
// =======================
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO categoria (nombre)
       VALUES ($1)
       RETURNING idcategoria, nombre, fechacreacion`,
      [nombre]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear categoría:", error.message);
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

// =======================
// OBTENER TODAS LAS CATEGORÍAS
// =======================
exports.obtenerCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT idcategoria, nombre, fechacreacion 
       FROM categoria ORDER BY idcategoria ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error.message);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

// =======================
// OBTENER CATEGORÍA POR ID
// =======================
exports.obtenerCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT idcategoria, nombre, fechacreacion 
       FROM categoria WHERE idcategoria=$1`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener categoría:", error.message);
    res.status(500).json({ error: "Error al obtener categoría" });
  }
};

// =======================
// ACTUALIZAR CATEGORÍA
// =======================
exports.actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre de la categoría es obligatorio" });
    }

    const result = await pool.query(
      `UPDATE categoria
       SET nombre=$1
       WHERE idcategoria=$2
       RETURNING idcategoria, nombre, fechacreacion`,
      [nombre, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar categoría:", error.message);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

// =======================
// ELIMINAR CATEGORÍA
// =======================
exports.eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM categoria WHERE idcategoria=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error.message);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};
