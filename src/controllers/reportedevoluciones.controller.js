const pool = require("../db");

// ========================
// REPORTE DE DEVOLUCIONES (COMPRAS Y VENTAS)
// ========================
exports.obtenerReporteDevoluciones = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // ----------------------------
    // DEVOLUCIONES DE COMPRA
    // ----------------------------
    const devolucionesComprasQuery = `
      SELECT 
        dc.iddevolucion AS id,
        'COMPRA' AS tipo,
        c.numerocompra AS numero,
        dc.fecha AS fecha,
        u.nombre AS usuario,
        p.nombre AS proveedor_cliente,
        dc.motivo,
        COALESCE(SUM(ddc.cantidad * ddc.precio), 0) AS total
      FROM devolucion_compra dc
      JOIN usuario u ON dc.idusuario = u.idusuario
      JOIN compra c ON dc.idcompra = c.idcompra
      JOIN proveedor p ON c.idprov = p.idprov
      LEFT JOIN detalle_devolucion_compra ddc ON dc.iddevolucion = ddc.iddevolucion
      WHERE dc.fecha BETWEEN $1 AND $2
      GROUP BY dc.iddevolucion, c.numerocompra, dc.fecha, u.nombre, p.nombre, dc.motivo
    `;

    // ----------------------------
    // DEVOLUCIONES DE VENTA
    // ----------------------------
    const devolucionesVentasQuery = `
      SELECT 
        dv.iddevolucion AS id,
        'VENTA' AS tipo,
        v.numerofactura AS numero,
        dv.fecha AS fecha,
        u.nombre AS usuario,
        c.nombre AS proveedor_cliente,
        dv.motivo,
        COALESCE(SUM(ddv.cantidad * ddv.precio), 0) AS total
      FROM devolucion_venta dv
      JOIN usuario u ON dv.idusuario = u.idusuario
      JOIN venta v ON dv.idventa = v.idventa
      JOIN cliente c ON v.idcliente = c.idcliente
      LEFT JOIN detalle_devolucion_venta ddv ON dv.iddevolucion = ddv.iddevolucion
      WHERE dv.fecha BETWEEN $1 AND $2
      GROUP BY dv.iddevolucion, v.numerofactura, dv.fecha, u.nombre, c.nombre, dv.motivo
    `;

    // Ejecutar ambas consultas
    const [compras, ventas] = await Promise.all([
      pool.query(devolucionesComprasQuery, [fechaInicio, fechaFin]),
      pool.query(devolucionesVentasQuery, [fechaInicio, fechaFin]),
    ]);

    // Combinar y ordenar resultados
    const resultado = [...compras.rows, ...ventas.rows].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

    res.json(resultado);
  } catch (error) {
    console.error("Error al generar reporte de devoluciones:", error);
    res.status(500).json({ error: "Error al generar reporte de devoluciones" });
  }
};
