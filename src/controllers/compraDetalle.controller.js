const pool = require("../db");

// Obtener información completa de una compra por número de compra o idcompra
exports.obtenerDetalleCompra = async (req, res) => {
  try {
    const { codigo } = req.params; // Puede ser idcompra (numérico) o numerocompra (texto)
    let compraQuery;

    if (!isNaN(codigo)) {
      // 🔹 Buscar por ID de compra
      compraQuery = await pool.query(`
        SELECT 
          co.idcompra,
          co.numerocompra,
          co.fecha,
          co.total,
          p.nombre AS proveedor,
          p.nit,
          p.telefono,
          p.direccion,
          u.nombre AS usuario
        FROM compra co
        JOIN proveedor p ON co.idprov = p.idprov
        JOIN usuario u ON co.idusuario = u.idusuario
        WHERE co.idcompra = $1
      `, [codigo]);
    } else {
      // 🔹 Buscar por número de compra
      compraQuery = await pool.query(`
        SELECT 
          co.idcompra,
          co.numerocompra,
          co.fecha,
          co.total,
          p.nombre AS proveedor,
          p.nit,
          p.telefono,
          p.direccion,
          u.nombre AS usuario
        FROM compra co
        JOIN proveedor p ON co.idprov = p.idprov
        JOIN usuario u ON co.idusuario = u.idusuario
        WHERE co.numerocompra = $1
      `, [codigo]);
    }

    if (compraQuery.rows.length === 0) {
      return res.status(404).json({ error: "Compra no encontrada" });
    }

    const compra = compraQuery.rows[0];

    // 🔹 Detalle de productos comprados (versión extendida)
    // 🔹 Detalle de productos comprados
const detalleQuery = await pool.query(`
  SELECT 
    p.codigo,
    p.nombre,
    p.detalle,
    p.bulto,
    p.presentacion,
    p.observaciones,
    c.nombre AS categoria,
    p.precio_venta,
    dc.cantidad,
    dc.precio_compra,
    dc.precio_unitario,
    dc.descuento,
    (dc.cantidad * dc.precio_compra - dc.descuento) AS subtotal
  FROM detalle_compra dc
  JOIN producto p ON dc.idproducto = p.idproducto
  JOIN categoria c ON p.idcategoria = c.idcategoria
  WHERE dc.idcompra = $1
`, [compra.idcompra]);

    // 🔹 Respuesta final
    res.json({
      compra,
      detalle: detalleQuery.rows
    });

  } catch (error) {
    console.error("Error al obtener detalle de compra:", error);
    res.status(500).json({ error: "Error al obtener detalle de compra" });
  }
};
