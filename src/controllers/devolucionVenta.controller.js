const pool = require("../db");

// ===============================
// CREAR DEVOLUCIÓN DE VENTA
// ===============================
exports.crearDevolucionVenta = async (req, res) => {
  const client = await pool.connect();
  try {
    const { idventa, idusuario, numerofactura, motivo, productos } = req.body;

    await client.query("BEGIN");

    // Crear registro principal de devolución
    const insertDevolucionQuery = `
      INSERT INTO devolucion_venta (idventa, idusuario, numerofactura, motivo)
      VALUES ($1, $2, $3, $4)
      RETURNING iddevolucion
    `;
    const { rows } = await client.query(insertDevolucionQuery, [
      idventa,
      idusuario,
      numerofactura,
      motivo,
    ]);

    const iddevolucion = rows[0].iddevolucion;

    let totalDevolucion = 0;

    // Insertar productos devueltos y actualizar stock
    for (const p of productos) {
      const subtotal = p.cantidad * p.precio;
      totalDevolucion += subtotal;

      await client.query(
        `
        INSERT INTO detalle_devolucion_venta (iddevolucion, idproducto, cantidad, precio)
        VALUES ($1, $2, $3, $4)
      `,
        [iddevolucion, p.idproducto, p.cantidad, p.precio]
      );

      // Sumar productos al stock (porque regresan al inventario)
      await client.query(
        `UPDATE producto SET stock = stock + $1 WHERE idproducto = $2`,
        [p.cantidad, p.idproducto]
      );
    }

    // Actualizar total de la devolución
    await client.query(
      `UPDATE devolucion_venta SET total = $1 WHERE iddevolucion = $2`,
      [totalDevolucion, iddevolucion]
    );

    await client.query("COMMIT");
    res.json({ message: "Devolución de venta registrada exitosamente." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en crearDevolucionVenta:", error);
    res.status(500).json({ error: "Error al registrar la devolución de venta." });
  } finally {
    client.release();
  }
};

// ===============================
// OBTENER TODAS LAS DEVOLUCIONES
// ===============================
exports.obtenerDevolucionesVenta = async (req, res) => {
  try {
    const query = `
      SELECT dv.iddevolucion, dv.numerofactura, dv.fecha, dv.total, u.nombre AS usuario
      FROM devolucion_venta dv
      LEFT JOIN usuario u ON dv.idusuario = u.idusuario
      ORDER BY dv.fecha DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error en obtenerDevolucionesVenta:", error);
    res.status(500).json({ error: "Error al obtener las devoluciones de venta." });
  }
};

// ===============================
// OBTENER DEVOLUCIÓN POR ID
// ===============================
exports.obtenerDevolucionVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const devolucionQuery = `
      SELECT dv.*, u.nombre AS usuario
      FROM devolucion_venta dv
      LEFT JOIN usuario u ON dv.idusuario = u.idusuario
      WHERE dv.iddevolucion = $1
    `;
    const devolucion = await pool.query(devolucionQuery, [id]);

    const detalleQuery = `
      SELECT ddv.*, p.nombre AS producto
      FROM detalle_devolucion_venta ddv
      INNER JOIN producto p ON ddv.idproducto = p.idproducto
      WHERE ddv.iddevolucion = $1
    `;
    const detalle = await pool.query(detalleQuery, [id]);

    res.json({ devolucion: devolucion.rows[0], detalle: detalle.rows });
  } catch (error) {
    console.error("Error en obtenerDevolucionVentaPorId:", error);
    res.status(500).json({ error: "Error al obtener la devolución de venta." });
  }
};


exports.obtenerVentaPorNumero = async (req, res) => {
  try {
    const { numerofactura } = req.params;

    // 🔹 Buscar la venta
    const ventaQuery = await pool.query(`
      SELECT 
        v.idventa,
        v.numerofactura,
        v.fecha,
        v.total,
        v.montorecibido,
        v.vuelto,
        c.nombre AS cliente,
        c.nit,
        c.telefono,
        c.direccion,
        u.nombre AS usuario,
        ca.idcaja
      FROM venta v
      JOIN cliente c ON v.idcliente = c.idcliente
      JOIN usuario u ON v.idusuario = u.idusuario
      LEFT JOIN caja ca ON v.idcaja = ca.idcaja
      WHERE v.numerofactura = $1
    `, [numerofactura]);

    if (ventaQuery.rows.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const venta = ventaQuery.rows[0];

    // 🔹 Detalle de productos con control de devoluciones
    const detalleQuery = await pool.query(`
      SELECT 
        p.idproducto,
        p.codigo,
        p.nombre,
        dv.cantidad,
        dv.precio_venta,
        dv.descuento,
        (dv.cantidad * dv.precio_venta - dv.descuento) AS subtotal,
        COALESCE(SUM(ddv.cantidad), 0) AS devuelta
      FROM detalle_venta dv
      JOIN producto p ON dv.idproducto = p.idproducto
      LEFT JOIN detalle_devolucion_venta ddv 
        ON ddv.idproducto = dv.idproducto
        AND ddv.iddevolucion IN (
          SELECT iddevolucion 
          FROM devolucion_venta 
          WHERE idventa = $1
        )
      WHERE dv.idventa = $1
      GROUP BY p.idproducto, p.codigo, p.nombre, dv.cantidad, dv.precio_venta, dv.descuento
    `, [venta.idventa]);

    // 🔹 Respuesta final
    res.json({
      venta,
      detalle: detalleQuery.rows
    });

  } catch (error) {
    console.error("Error al obtener detalle de venta:", error);
    res.status(500).json({ error: "Error al obtener detalle de venta" });
  }
};
