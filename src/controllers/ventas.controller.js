const pool = require("../db");

// ========================
// CREAR NUEVA VENTA
// ========================
exports.crearVenta = async (req, res) => {
  const client = await pool.connect();
  try {
    const { idcliente, fecha, productos } = req.body;
    if (!productos || productos.length === 0)
      return res.status(400).json({ error: "Faltan productos para la venta" });

    await client.query("BEGIN");

    // Calcular total de la venta
    const total = productos.reduce((acc, p) => {
      const subtotal = (p.precio_venta || 0) * (p.cantidad || 0) - (p.descuento || 0);
      return acc + subtotal;
    }, 0);

    // Insertar venta
    const ventaRes = await client.query(
      `INSERT INTO venta (idcliente, fecha, total)
       VALUES ($1, $2, $3) RETURNING idventa`,
      [idcliente || null, fecha || new Date(), total]
    );
    const idventa = ventaRes.rows[0].idventa;

    const productosGuardados = [];

    for (const p of productos) {
      // Insertar detalle de venta
      const detalleRes = await client.query(
        `INSERT INTO detalle_venta (idventa, idproducto, cantidad, precio_venta, descuento)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [idventa, p.idproducto, p.cantidad, p.precio_venta, p.descuento || 0]
      );

      // Actualizar stock (restar)
      await client.query(
        `UPDATE producto SET stock = stock - $1 WHERE idproducto = $2`,
        [p.cantidad, p.idproducto]
      );

      productosGuardados.push({ ...detalleRes.rows[0] });
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "Venta registrada correctamente",
      venta: { idventa, idcliente, fecha, total, productos: productosGuardados },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear venta:", error);
    res.status(500).json({ error: "No se pudo registrar la venta", detalle: error.message });
  } finally {
    client.release();
  }
};

// ========================
// OBTENER TODAS LAS VENTAS
// ========================
exports.obtenerVentas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.idventa, v.fecha, v.total, c.nombre AS cliente
      FROM venta v
      LEFT JOIN cliente c ON v.idcliente = c.idcliente
      ORDER BY v.fecha DESC, v.idventa DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "No se pudieron obtener las ventas" });
  }
};

// ========================
// OBTENER DETALLE DE UNA VENTA
// ========================
exports.obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT dv.iddetalle_venta, p.nombre, dv.cantidad, dv.precio_venta, dv.descuento
       FROM detalle_venta dv
       INNER JOIN producto p ON dv.idproducto = p.idproducto
       WHERE dv.idventa = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalle de venta:", error);
    res.status(500).json({ error: "No se pudo obtener el detalle de la venta" });
  }
};
