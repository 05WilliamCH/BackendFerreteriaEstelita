const pool = require("../db");

// ========================
// CREAR DEVOLUCIÓN DE COMPRA (AL PROVEEDOR)
// ========================
exports.crearDevolucionSegura = async (req, res) => {
  const client = await pool.connect();

  try {
    const { numerocompra, idusuario, motivo, productos } = req.body;

    if (!numerocompra || !productos || productos.length === 0) {
      return res.status(400).json({ error: "Faltan datos de numerocompra o productos" });
    }

    await client.query("BEGIN");

    // 1️⃣ Verificar que la compra exista
    const compraRes = await client.query(
      `SELECT idcompra FROM compra WHERE numerocompra = $1`,
      [numerocompra]
    );

    if (compraRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Compra no encontrada" });
    }

    const idcompra = compraRes.rows[0].idcompra;

    // 2️⃣ Validar productos
    const productosValidos = [];

    for (const p of productos) {
      const detRes = await client.query(
        `SELECT dp.idproducto, dp.cantidad, dp.precio_unitario,
                COALESCE(SUM(ddc.cantidad),0) AS devuelta
         FROM detalle_compra dp
         LEFT JOIN detalle_devolucion_compra ddc
           ON dp.idproducto = ddc.idproducto
           AND ddc.iddevolucion IN (
             SELECT iddevolucion FROM devolucion_compra WHERE idcompra = $1
           )
         WHERE dp.idcompra = $1 AND dp.idproducto = $2
         GROUP BY dp.idproducto, dp.cantidad, dp.precio_unitario`,
        [idcompra, p.idproducto]
      );

      if (detRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Producto ID ${p.idproducto} no encontrado en la compra` });
      }

      const detalle = detRes.rows[0];
      const maxDevolver = parseFloat(detalle.cantidad) - parseFloat(detalle.devuelta);

      if (p.cantidad <= 0 || p.cantidad > maxDevolver) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Cantidad inválida para el producto ${detalle.idproducto}. Máximo a devolver: ${maxDevolver}`
        });
      }

      productosValidos.push({
        idproducto: detalle.idproducto,
        cantidad: p.cantidad,
        precio: parseFloat(detalle.precio_unitario)
      });
    }

    // 3️⃣ Insertar la devolución principal
    const totalDevolucion = productosValidos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);

    const devolucionRes = await client.query(
      `INSERT INTO devolucion_compra (idcompra, idusuario, numerocompra, motivo, total)
       VALUES ($1,$2,$3,$4,$5) RETURNING iddevolucion`,
      [idcompra, idusuario || null, numerocompra, motivo, totalDevolucion]
    );

    const iddevolucion = devolucionRes.rows[0].iddevolucion;

    // 4️⃣ Insertar detalles y RESTAR stock
    for (const p of productosValidos) {
      await client.query(
        `INSERT INTO detalle_devolucion_compra (iddevolucion, idproducto, cantidad, precio)
         VALUES ($1,$2,$3,$4)`,
        [iddevolucion, p.idproducto, p.cantidad, p.precio]
      );

      // 🔻 RESTAR stock (porque el producto se devuelve al proveedor)
      await client.query(
        `UPDATE producto SET stock = stock - $1 WHERE idproducto = $2`,
        [p.cantidad, p.idproducto]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Devolución registrada correctamente (stock actualizado)",
      iddevolucion,
      productos: productosValidos
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear devolución:", error);
    res.status(500).json({ error: "No se pudo registrar la devolución", detalle: error.message });
  } finally {
    client.release();
  }
};


// =======================================
// OBTENER PRODUCTOS POR NUMEROCOMPRA
// =======================================
exports.obtenerProductosPorNumeroCompra = async (req, res) => {
  try {
    const { numerocompra } = req.params;

    const compraRes = await pool.query(
      `SELECT idcompra FROM compra WHERE numerocompra = $1`,
      [numerocompra]
    );
    if (compraRes.rows.length === 0) return res.status(404).json([]);

    const idcompra = compraRes.rows[0].idcompra;

    const productosRes = await pool.query(
      `SELECT p.idproducto, p.codigo, p.nombre, dp.cantidad, dp.precio_unitario,
              COALESCE(SUM(ddc.cantidad),0) AS devuelta
       FROM detalle_compra dp
       JOIN producto p ON dp.idproducto = p.idproducto
       LEFT JOIN detalle_devolucion_compra ddc
         ON dp.idproducto = ddc.idproducto
         AND ddc.iddevolucion IN (
           SELECT iddevolucion FROM devolucion_compra WHERE idcompra=$1
         )
       WHERE dp.idcompra = $1
       GROUP BY p.idproducto, dp.cantidad, dp.precio_unitario, p.codigo, p.nombre`,
      [idcompra]
    );

    res.json(productosRes.rows);
  } catch (error) {
    console.error("Error al obtener productos por numerocompra:", error);
    res.status(500).json([]);
  }
};
