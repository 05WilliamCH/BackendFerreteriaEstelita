const pool = require("../db");

// =======================
// OBTENER TODOS LOS PRODUCTOS
// =======================
exports.obtenerProductos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.idproducto, p.codigo, p.nombre, p.bulto, p.detalle, p.presentacion,
             p.observaciones, p.fecha_vencimiento, p.stock,
             c.idcategoria, c.nombre AS categoria,
             pr.idprov, pr.nombre AS proveedor
      FROM producto p
      JOIN categoria c ON p.idcategoria = c.idcategoria
      JOIN proveedor pr ON p.idprov = pr.idprov
      ORDER BY p.idproducto ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// =======================
// CREAR PRODUCTO
// =======================
exports.crearProducto = async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      bulto,
      detalle,
      presentacion,
      observaciones,
      fecha_vencimiento,
      stock,
      idcategoria,
      idprov,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO producto (codigo, nombre, bulto, detalle, presentacion, observaciones,
        fecha_vencimiento, stock, idcategoria, idprov)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        codigo,
        nombre,
        bulto || null,
        detalle || null,
        presentacion || null,
        observaciones || null,
        fecha_vencimiento || null,
        stock || 0,
        idcategoria,
        idprov,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// =======================
// ACTUALIZAR PRODUCTO
// =======================
exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const {
    codigo,
    nombre,
    bulto,
    detalle,
    presentacion,
    observaciones,
    fecha_vencimiento,
    stock,
    idcategoria,
    idprov,
  } = req.body;

  try {
    const existe = await pool.query(
      "SELECT idproducto FROM producto WHERE idproducto = $1",
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const result = await pool.query(
      `UPDATE producto
       SET codigo = $1, nombre = $2, bulto = $3, detalle = $4,
           presentacion = $5, observaciones = $6, fecha_vencimiento = $7,
           stock = $8, idcategoria = $9, idprov = $10
       WHERE idproducto = $11 RETURNING *`,
      [
        codigo,
        nombre,
        bulto || null,
        detalle || null,
        presentacion || null,
        observaciones || null,
        fecha_vencimiento || null,
        stock,
        idcategoria,
        idprov,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// =======================
// ELIMINAR PRODUCTO
// =======================
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const existe = await pool.query(
      "SELECT idproducto FROM producto WHERE idproducto = $1",
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await pool.query("DELETE FROM producto WHERE idproducto = $1", [id]);
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// =======================
// OBTENER PRODUCTO POR CÓDIGO
// =======================
exports.obtenerProductoPorCodigo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.idproducto, p.codigo, p.nombre, p.bulto, p.detalle, p.presentacion,
              p.observaciones, p.fecha_vencimiento, p.stock,
              c.idcategoria, c.nombre AS categoria,
              pr.idprov, pr.nombre AS proveedor
       FROM producto p
       JOIN categoria c ON p.idcategoria = c.idcategoria
       JOIN proveedor pr ON p.idprov = pr.idprov
       WHERE p.codigo = $1`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener producto por código:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};
