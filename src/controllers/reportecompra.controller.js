const pool = require("../db");

// ========================
// REPORTE DE COMPRAS (sin dayjs)
// ========================
exports.obtenerReporteCompras = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT
        c.idcompra,
        TO_CHAR(c.fecha, 'DD/MM/YYYY') AS fecha_compra,
        u.nombre AS usuario,
        p.nombre AS proveedor,
        SUM(dc.cantidad) AS unidades_compradas,
        COUNT(DISTINCT dc.idproducto) AS cantidad_productos,
        SUM(dc.cantidad * dc.precio_compra - dc.descuento) AS total_compra
      FROM compra c
      JOIN detalle_compra dc ON c.idcompra = dc.idcompra
      LEFT JOIN usuario u ON c.idusuario = u.idusuario
      LEFT JOIN proveedor p ON c.idprov = p.idprov
      WHERE 1=1
    `;

    const params = [];

    if (fechaInicio) {
      params.push(fechaInicio);
      query += ` AND c.fecha >= $${params.length}`;
    }
    if (fechaFin) {
      params.push(fechaFin);
      query += ` AND c.fecha <= $${params.length}`;
    }

    query += `
      GROUP BY c.idcompra, c.fecha, u.nombre, p.nombre
      ORDER BY c.fecha DESC
    `;

    const result = await client.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al generar el reporte de compras:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    client.release();
  }
};
