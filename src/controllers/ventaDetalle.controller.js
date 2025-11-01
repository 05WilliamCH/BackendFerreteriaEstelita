const pool = require("../db");

// Obtener información completa de una venta por número de factura o idventa
exports.obtenerDetalleVenta = async (req, res) => {
  try {
    const { codigo } = req.params; // Puede ser idventa (numérico) o numerofactura (texto)
    let ventaQuery;

    if (!isNaN(codigo)) {
      // 🔹 Buscar por ID de venta
      ventaQuery = await pool.query(`
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
        WHERE v.idventa = $1
      `, [codigo]);
    } else {
      // 🔹 Buscar por número de factura
      ventaQuery = await pool.query(`
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
      `, [codigo]);
    }

    if (ventaQuery.rows.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const venta = ventaQuery.rows[0];

    // 🔹 Detalle de productos vendidos
    const detalleQuery = await pool.query(`
      SELECT 
        p.codigo,
        p.nombre,
        dv.cantidad,
        dv.precio_venta,
        dv.descuento,
        (dv.cantidad * dv.precio_venta - dv.descuento) AS subtotal
      FROM detalle_venta dv
      JOIN producto p ON dv.idproducto = p.idproducto
      WHERE dv.idventa = $1
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
