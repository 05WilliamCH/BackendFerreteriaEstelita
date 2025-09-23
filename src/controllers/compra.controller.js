const pool = require("../db");

// =======================
// CREAR NUEVA COMPRA (productos nuevos o existentes)
// =======================
exports.crearCompra = async (req, res) => {
  const client = await pool.connect();

  try {
    const { idprov, fecha, total, productos } = req.body;

    // Validaciones básicas
    if (!idprov || !fecha || !productos || productos.length === 0) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await client.query("BEGIN");

    // 1️⃣ Insertar la compra en la tabla compra
    const compraResult = await client.query(
      `INSERT INTO compra (idprov, fecha, total) VALUES ($1, $2, $3) RETURNING *`,
      [idprov, fecha, total]
    );
    const idcompra = compraResult.rows[0].idcompra;

    // 2️⃣ Recorrer productos y agregarlos a detalle_compra
    for (const p of productos) {
      let idproducto = p.idproducto;

      // Si el producto no existe, crear primero
      if (!idproducto) {
        const resProd = await client.query(
          `INSERT INTO producto 
            (codigo, idcategoria, nombre, bulto, detalle, stock, idprov)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING idproducto`,
          [
            p.codigo,
            p.idcategoria,
            p.nombre,
            p.bulto || null,
            p.detalle || null,
            p.cantidad,
            idprov // ✅ asignar el proveedor de la compra
          ]
        );
        idproducto = resProd.rows[0].idproducto;
      }

      // Insertar en detalle_compra
      await client.query(
        `INSERT INTO detalle_compra 
          (idcompra, idproducto, cantidad, precio_compra, precio_unitario, descuento)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          idcompra,
          idproducto,
          p.cantidad,
          p.precio || 0,
          p.precio || 0,
          p.descuento || 0
        ]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "Compra registrada correctamente",
      compra: compraResult.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear compra:", error);
    res.status(500).json({ error: "Error al crear compra" });
  } finally {
    client.release();
  }
};

// =======================
// OBTENER TODAS LAS COMPRAS
// =======================
exports.obtenerCompras = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.idcompra, c.fecha, c.total, pr.nombre AS proveedor
      FROM compra c
      JOIN proveedor pr ON c.idprov = pr.idprov
      ORDER BY c.idcompra DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener compras:", error);
    res.status(500).json({ error: "Error al obtener compras" });
  }
};
