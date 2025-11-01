const pool = require("../db");

exports.obtenerKardex = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, idusuario, idcategoria, busqueda } = req.query;

    const query = `
      WITH movimientos AS (
        -- COMPRAS
        SELECT
          p.idproducto,
          p.codigo,
          p.nombre AS producto,
          cat.nombre AS categoria,
          c.fecha AS fecha_movimiento,
          u.nombre AS usuario,
          'COMPRA' AS tipo_movimiento,
          dc.cantidad AS cantidad,
          dc.precio_compra AS precio,
          (dc.cantidad * dc.precio_compra) AS total,
          p.stock -- <-- Solo llamamos la columna stock
        FROM detalle_compra dc
        INNER JOIN compra c ON c.idcompra = dc.idcompra
        INNER JOIN producto p ON p.idproducto = dc.idproducto
        INNER JOIN categoria cat ON cat.idcategoria = p.idcategoria
        INNER JOIN usuario u ON u.idusuario = c.idusuario
        WHERE ($1::DATE IS NULL OR c.fecha::DATE >= $1::DATE)
          AND ($2::DATE IS NULL OR c.fecha::DATE <= $2::DATE)
          AND ($3::INT IS NULL OR u.idusuario = $3)
          AND ($4::INT IS NULL OR p.idcategoria = $4)
          AND ($5::TEXT IS NULL OR p.nombre ILIKE '%' || $5 || '%' OR p.codigo ILIKE '%' || $5 || '%')

        UNION ALL

        -- VENTAS
        SELECT
          p.idproducto,
          p.codigo,
          p.nombre AS producto,
          cat.nombre AS categoria,
          v.fecha AS fecha_movimiento,
          u.nombre AS usuario,
          'VENTA' AS tipo_movimiento,
          dv.cantidad AS cantidad,
          dv.precio_venta AS precio,
          (dv.cantidad * dv.precio_venta) AS total,
          p.stock -- <-- Solo llamamos la columna stock
        FROM detalle_venta dv
        INNER JOIN venta v ON v.idventa = dv.idventa
        INNER JOIN producto p ON p.idproducto = dv.idproducto
        INNER JOIN categoria cat ON cat.idcategoria = p.idcategoria
        INNER JOIN usuario u ON u.idusuario = v.idusuario
        WHERE ($1::DATE IS NULL OR v.fecha::DATE >= $1::DATE)
          AND ($2::DATE IS NULL OR v.fecha::DATE <= $2::DATE)
          AND ($3::INT IS NULL OR u.idusuario = $3)
          AND ($4::INT IS NULL OR p.idcategoria = $4)
          AND ($5::TEXT IS NULL OR p.nombre ILIKE '%' || $5 || '%' OR p.codigo ILIKE '%' || $5 || '%')
      )
      SELECT *
      FROM movimientos
      ORDER BY fecha_movimiento ASC, tipo_movimiento DESC;
    `;

    const result = await pool.query(query, [
      fechaInicio || null,
      fechaFin || null,
      idusuario || null,
      idcategoria || null,
      busqueda || null,
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener kardex:", error);
    res.status(500).json({ message: "Error al obtener kardex", error });
  }
};
