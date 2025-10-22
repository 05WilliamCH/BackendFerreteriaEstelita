const pool = require("../db");

// Obtener datos generales para el dashboard
exports.obtenerDatosDashboard = async (req, res) => {
  try {
    const [ventasSemana, totales, productosPorCategoria, ventasHoy] = await Promise.all([
      // Ventas últimos 7 días
      pool.query(`
        SELECT 
          CASE EXTRACT(DOW FROM fecha)
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
          END AS dia,
          SUM(total) AS total_ventas
        FROM venta
        WHERE fecha >= NOW() - INTERVAL '7 days'
        GROUP BY dia, EXTRACT(DOW FROM fecha)
        ORDER BY EXTRACT(DOW FROM fecha);
      `),
      // Totales generales (productos y categorías)
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM producto) AS total_productos,
          (SELECT COUNT(*) FROM categoria) AS total_categorias
      `),
      // Productos por categoría
      pool.query(`
        SELECT c.nombre AS nombre_categoria, COUNT(p.idproducto) AS cantidad
        FROM categoria c
        LEFT JOIN producto p ON c.idcategoria = p.idcategoria
        GROUP BY c.idcategoria, c.nombre
        ORDER BY c.nombre;
      `),
      // Ventas del día
      pool.query(`
        SELECT COALESCE(SUM(total), 0) AS total_ventas_hoy
        FROM venta
        WHERE fecha::date = CURRENT_DATE;
      `)
    ]);

    res.json({
      ventasSemana: ventasSemana.rows,
      totales: totales.rows[0],
      productosPorCategoria: productosPorCategoria.rows,
      ventasHoy: ventasHoy.rows[0].total_ventas_hoy
    });

  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
};
