const pool = require("../db");

// ========================
// REPORTE DE VENTAS (con usuario)
// ========================
exports.obtenerReporteVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT 
        v.idventa,
        TO_CHAR(v.fecha, 'YYYY-MM-DD') AS fecha_venta,
        c.nombre AS cliente,
        u.nombre AS usuario,
        v.numerofactura,
        COUNT(DISTINCT dv.idproducto) AS cantidad_productos,
        SUM(dv.cantidad) AS unidades_vendidas,
        v.total AS total_venta
      FROM venta v
      LEFT JOIN cliente c ON v.idcliente = c.idcliente
      LEFT JOIN usuario u ON v.idusuario = u.idusuario
      LEFT JOIN detalle_venta dv ON v.idventa = dv.idventa
      WHERE 1=1
    `;

    const params = [];

    // Filtro de fechas
    if (fechaInicio && fechaFin) {
      params.push(fechaInicio, fechaFin);
      query += ` AND DATE(v.fecha) BETWEEN $1 AND $2`;
    }

    query += `
      GROUP BY v.idventa, c.nombre, u.nombre
      ORDER BY v.fecha DESC;
    `;

    const { rows } = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener reporte de ventas:", error);
    res.status(500).json({ error: "Error al obtener reporte de ventas" });
  }
};
