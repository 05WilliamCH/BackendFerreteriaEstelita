const pool = require("../db");

// =======================
// OBTENER TODAS LAS COMPRAS
// =======================
exports.obtenerCompras = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.idcompra, c.fecha, c.total, p.nombre AS proveedor
       FROM compra c
       JOIN proveedor p ON c.idprov = p.idprov
       ORDER BY c.fecha DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener compras:", error.message);
    res.status(500).json({ error: "Error al obtener compras" });
  }
};

// =======================
// OBTENER COMPRA POR ID
// =======================
exports.obtenerCompra = async (req, res) => {
  const { id } = req.params;
  try {
    const compra = await pool.query(
      `SELECT c.idcompra, c.fecha, c.total, p.nombre AS proveedor
       FROM compra c
       JOIN proveedor p ON c.idprov = p.idprov
       WHERE c.idcompra=$1`,
      [id]
    );

    if (compra.rows.length === 0)
      return res.status(404).json({ error: "Compra no encontrada" });

    const detalles = await pool.query(
      `SELECT dc.iddetalle_compra, pr.nombre AS producto, dc.cantidad, dc.precio_compra, dc.precio_unitario, dc.descuento
       FROM detalle_compra dc
       JOIN producto pr ON dc.idproducto = pr.idproducto
       WHERE dc.idcompra=$1`,
      [id]
    );

    res.json({ compra: compra.rows[0], detalles: detalles.rows });
  } catch (error) {
    console.error("Error al obtener la compra:", error.message);
    res.status(500).json({ error: "Error al obtener la compra" });
  }
};

// =======================
// CREAR COMPRA CON DETALLES
// =======================
exports.crearCompra = async (req, res) => {
  const { idprov, total, detalles } = req.body; 
  // detalles = [{ idproducto, cantidad, precio_compra, descuento }]

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Insertar la compra
    const compraResult = await client.query(
      `INSERT INTO compra (idprov, total) VALUES ($1, $2) RETURNING idcompra`,
      [idprov, total]
    );
    const idcompra = compraResult.rows[0].idcompra;

    // 2️⃣ Insertar cada detalle
    for (const item of detalles) {
      await client.query(
        `INSERT INTO detalle_compra (idcompra, idproducto, cantidad, precio_compra, precio_unitario, descuento)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          idcompra,
          item.idproducto,
          item.cantidad,
          item.precio_compra,
          item.precio_unitario || item.precio_compra,
          item.descuento || 0
        ]
      );
      // 🔹 El trigger aumentará el stock automáticamente
    }

    await client.query("COMMIT");
    res.status(201).json({ mensaje: "Compra registrada correctamente", idcompra });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear compra:", error.message);
    res.status(500).json({ error: "Error al crear compra" });
  } finally {
    client.release();
  }
};
