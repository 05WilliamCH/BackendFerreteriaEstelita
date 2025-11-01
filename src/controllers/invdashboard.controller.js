const pool = require("../db");

exports.obtenerResumenInventario = async (req, res) => {
  try {
    // ---------- Total de productos y valor del inventario ----------
    const totalProductosQuery = await pool.query(`
      SELECT 
        COUNT(*) AS totalproductos,
        COALESCE(SUM(stock * precio_venta),0) AS valorinventario
      FROM producto
    `);

    // ---------- Productos bajo stock (≤ 5) ----------
    const productosBajoStockQuery = await pool.query(`
      SELECT idproducto, nombre, stock
      FROM producto
      WHERE stock <= 5
      ORDER BY stock ASC
    `);

    // ---------- Productos más vendidos (top 5) ----------
    const productosMasVendidosQuery = await pool.query(`
      SELECT p.idproducto, p.nombre, COALESCE(SUM(dv.cantidad),0) AS total_vendido
      FROM detalle_venta dv
      JOIN producto p ON dv.idproducto = p.idproducto
      GROUP BY p.idproducto, p.nombre
      ORDER BY total_vendido DESC
      LIMIT 5
    `);

    // ---------- Productos con mayor stock (top 5) ----------
    const productosMayorStockQuery = await pool.query(`
      SELECT idproducto, nombre, stock
      FROM producto
      ORDER BY stock DESC
      LIMIT 5
    `);

    // ---------- Clientes más frecuentes (top 5) ----------
    const clientesFrecuentesQuery = await pool.query(`
      SELECT c.idcliente, c.nombre, COUNT(v.idventa) AS total_compras
      FROM venta v
      JOIN cliente c ON v.idcliente = c.idcliente
      GROUP BY c.idcliente, c.nombre
      ORDER BY total_compras DESC
      LIMIT 5
    `);

    // ---------- Promedio de ventas por cliente ----------
    const promedioVentasClienteQuery = await pool.query(`
      SELECT 
        ROUND(AVG(total_cliente), 2) AS promedio_ventas_cliente
      FROM (
        SELECT c.idcliente, SUM(v.total) AS total_cliente
        FROM venta v
        JOIN cliente c ON v.idcliente = c.idcliente
        GROUP BY c.idcliente
      ) sub
    `);

    // ---------- Proveedores más recurrentes (top 5) ----------
    const proveedoresRecurrentesQuery = await pool.query(`
      SELECT p.idprov, p.nombre, COUNT(c.idcompra) AS total_compras
      FROM compra c
      JOIN proveedor p ON c.idprov = p.idprov
      GROUP BY p.idprov, p.nombre
      ORDER BY total_compras DESC
      LIMIT 5
    `);

    // ---------- Productos próximos a vencer (30 días) ----------
    const productosProximosVencerQuery = await pool.query(`
      SELECT idproducto, nombre, fecha_vencimiento, stock
      FROM producto
      WHERE fecha_vencimiento IS NOT NULL
        AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY fecha_vencimiento ASC
    `);

    // ---------- Total de ventas por mes (últimos 6 meses) ----------
    const ventasPorMesQuery = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha), 'Mon YYYY') AS mes,
        SUM(total) AS total_ventas
      FROM venta
      WHERE fecha >= (CURRENT_DATE - INTERVAL '6 months')
      GROUP BY DATE_TRUNC('month', fecha)
      ORDER BY DATE_TRUNC('month', fecha)
    `);

    // ---------- Respuesta final ----------
    res.json({
      totalProductos: parseInt(totalProductosQuery.rows[0].totalproductos, 10),
      valorInventario: parseFloat(totalProductosQuery.rows[0].valorinventario),
      productos_bajo_stock: productosBajoStockQuery.rows,
      productos_mas_vendidos: productosMasVendidosQuery.rows,
      productos_mayor_stock: productosMayorStockQuery.rows,
      clientes_frecuentes: clientesFrecuentesQuery.rows,
      promedio_ventas_cliente: parseFloat(promedioVentasClienteQuery.rows[0]?.promedio_ventas_cliente || 0),
      proveedores_recurrentes: proveedoresRecurrentesQuery.rows,
      productos_proximos_vencer: productosProximosVencerQuery.rows,
      ventas_por_mes: ventasPorMesQuery.rows
    });

  } catch (error) {
    console.error("Error en obtenerResumenInventario:", error.message);
    res.status(500).json({ error: "Error al obtener el resumen del inventario" });
  }
};
