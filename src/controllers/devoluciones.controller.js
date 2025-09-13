const pool = require("../db");

// =======================
// CREAR DEVOLUCIÓN
// =======================
exports.crearDevolucion = async (req, res) => {
  try {
    const { nombre_cliente, nombre_producto, cantidad, observaciones, telefono, numero_factura } = req.body;

    // Validación básica
    if (!nombre_cliente || nombre_cliente.trim() === "") {
      return res.status(400).json({ error: "El nombre del cliente es obligatorio" });
    }
    if (!nombre_producto || nombre_producto.trim() === "") {
      return res.status(400).json({ error: "El nombre del producto es obligatorio" });
    }
    if (!cantidad || cantidad.trim() === "") {
      return res.status(400).json({ error: "La cantidad es obligatoria" });
    }

    const result = await pool.query(
      `INSERT INTO devoluciones 
        (nombre_cliente, nombre_producto, cantidad, observaciones, telefono, numero_factura)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre_cliente, nombre_producto, cantidad, observaciones, telefono, numero_factura]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear devolución:", error.message);
    res.status(500).json({ error: "Error al crear devolución" });
  }
};

// =======================
// OBTENER TODAS LAS DEVOLUCIONES
// =======================
exports.obtenerDevoluciones = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM devoluciones ORDER BY iddevolucion ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener devoluciones:", error.message);
    res.status(500).json({ error: "Error al obtener devoluciones" });
  }
};

// =======================
// OBTENER DEVOLUCIÓN POR ID
// =======================
exports.obtenerDevolucion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM devoluciones WHERE iddevolucion=$1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Devolución no encontrada" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener devolución:", error.message);
    res.status(500).json({ error: "Error al obtener devolución" });
  }
};

// =======================
// ACTUALIZAR DEVOLUCIÓN
// =======================
exports.actualizarDevolucion = async (req, res) => {
  const { id } = req.params;
  const { nombre_cliente, nombre_producto, cantidad, observaciones, telefono, numero_factura } = req.body;

  try {
    if (!nombre_cliente || nombre_cliente.trim() === "") {
      return res.status(400).json({ error: "El nombre del cliente es obligatorio" });
    }
    if (!nombre_producto || nombre_producto.trim() === "") {
      return res.status(400).json({ error: "El nombre del producto es obligatorio" });
    }
    if (!cantidad || cantidad.trim() === "") {
      return res.status(400).json({ error: "La cantidad es obligatoria" });
    }

    const result = await pool.query(
      `UPDATE devoluciones
       SET nombre_cliente=$1, nombre_producto=$2, cantidad=$3, observaciones=$4, telefono=$5, numero_factura=$6
       WHERE iddevolucion=$7
       RETURNING *`,
      [nombre_cliente, nombre_producto, cantidad, observaciones, telefono, numero_factura, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Devolución no encontrada" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar devolución:", error.message);
    res.status(500).json({ error: "Error al actualizar devolución" });
  }
};

// =======================
// ELIMINAR DEVOLUCIÓN
// =======================
exports.eliminarDevolucion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM devoluciones WHERE iddevolucion=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Devolución no encontrada" });

    res.json({ mensaje: "Devolución eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar devolución:", error.message);
    res.status(500).json({ error: "Error al eliminar devolución" });
  }
};
