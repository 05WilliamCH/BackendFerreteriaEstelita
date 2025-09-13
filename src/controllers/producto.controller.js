const pool = require("../db");

// =======================
// OBTENER TODOS LOS PRODUCTOS
// =======================
exports.obtenerProductos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.idproducto, p.codigo, p.nombre, p.detalle, p.presentacion, p.observaciones,
              p.stock, c.nombre AS categoria, pr.nombre AS proveedor
       FROM producto p
       JOIN categoria c ON p.idcategoria = c.idcategoria
       JOIN proveedor pr ON p.idprov = pr.idprov
       ORDER BY p.idproducto ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// =======================
// OBTENER PRODUCTO POR ID
// =======================
exports.obtenerProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.idproducto, p.codigo, p.nombre, p.detalle, p.presentacion, p.observaciones,
              p.stock, c.nombre AS categoria, pr.nombre AS proveedor
       FROM producto p
       JOIN categoria c ON p.idcategoria = c.idcategoria
       JOIN proveedor pr ON p.idprov = pr.idprov
       WHERE p.idproducto = $1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error.message);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

// =======================
// CREAR PRODUCTO
// =======================
exports.crearProducto = async (req, res) => {
  const { codigo, idcategoria, idprov, nombre, detalle, presentacion, observaciones, stock } = req.body;

  if (!codigo || !idcategoria || !idprov || !nombre) {
    return res.status(400).json({ error: "Código, categoría, proveedor y nombre son obligatorios" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO producto (codigo, idcategoria, idprov, nombre, detalle, presentacion, observaciones, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [codigo, idcategoria, idprov, nombre, detalle || "", presentacion || "", observaciones || "", stock || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// =======================
// ACTUALIZAR PRODUCTO
// =======================
exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { codigo, idcategoria, idprov, nombre, detalle, presentacion, observaciones, stock } = req.body;

  try {
    const result = await pool.query(
      `UPDATE producto
       SET codigo=$1, idcategoria=$2, idprov=$3, nombre=$4, detalle=$5, presentacion=$6, observaciones=$7, stock=$8
       WHERE idproducto=$9
       RETURNING *`,
      [codigo, idcategoria, idprov, nombre, detalle || "", presentacion || "", observaciones || "", stock || 0, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// =======================
// ELIMINAR PRODUCTO
// =======================
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM producto WHERE idproducto=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};
