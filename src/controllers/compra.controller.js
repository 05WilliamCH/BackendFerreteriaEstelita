const pool = require("../db");

// ========================
// CREAR NUEVA COMPRA (con numerocompra)
// ========================
exports.crearCompra = async (req, res) => {
  const client = await pool.connect();
  try {
    const { idprov, idusuario, fecha, total, productos } = req.body;

    if (!idprov || !productos || productos.length === 0)
      return res.status(400).json({ error: "Faltan datos de proveedor o productos" });

    await client.query("BEGIN");

    // 🔹 Generar numerocompra automático
    const fechaHoy = new Date();
    const fechaStr = fechaHoy.toISOString().slice(0, 10).replace(/-/g, "");
    const lastCompraRes = await client.query(
      `SELECT numerocompra FROM compra WHERE numerocompra LIKE $1 ORDER BY idcompra DESC LIMIT 1`,
      [`COMP-${fechaStr}-%`]
    );

    let nextNumber = 1;
    if (lastCompraRes.rows.length > 0) {
      const lastNum = lastCompraRes.rows[0].numerocompra.split("-")[2];
      nextNumber = parseInt(lastNum) + 1;
    }

    const numerocompra = `COMP-${fechaStr}-${String(nextNumber).padStart(4, "0")}`;

    // Insertar compra
    const compraRes = await client.query(
      `INSERT INTO compra (idprov, idusuario, fecha, total, numerocompra)
       VALUES ($1, $2, $3, $4, $5) RETURNING idcompra, numerocompra`,
      [idprov, idusuario || null, fecha || new Date(), total || 0, numerocompra]
    );

    const idcompra = compraRes.rows[0].idcompra;
    const productosGuardados = [];

    // 🔹 Recorrer productos
    for (const p of productos) {
      let idproducto = p.idproducto;

      if (!idproducto) {
        // Crear producto nuevo con los nuevos campos
        const prodRes = await client.query(
          `INSERT INTO producto 
           (codigo, idcategoria, nombre, bulto, detalle, presentacion, observaciones, fecha_vencimiento, stock, idprov, precio_venta)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING idproducto`,
          [
            p.codigo,
            p.idcategoria,
            p.nombre,
            p.bulto || null,
            p.detalle || null,
            p.presentacion || null,
            p.observaciones || null,
            p.fecha_vencimiento || null,
            p.cantidad,
            idprov,
            p.precio_venta || 0,
          ]
        );
        idproducto = prodRes.rows[0].idproducto;
      } else {
        // Actualizar stock y precio de venta si cambió
        await client.query(
          `UPDATE producto 
           SET stock = stock + $1, 
               presentacion = COALESCE($2, presentacion), 
               observaciones = COALESCE($3, observaciones), 
               precio_venta = COALESCE($4, precio_venta)
           WHERE idproducto = $5`,
          [p.cantidad, p.presentacion, p.observaciones, p.precio_venta, idproducto]
        );
      }

      // Insertar detalle de compra
      const detalleRes = await client.query(
        `INSERT INTO detalle_compra (idcompra, idproducto, cantidad, precio_compra, precio_unitario, descuento)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [
          idcompra,
          idproducto,
          p.cantidad,
          (p.precio || 0) * p.cantidad,
          p.precio || 0,
          p.descuento || 0,
        ]
      );

      productosGuardados.push({ idproducto, ...detalleRes.rows[0] });
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Compra registrada correctamente",
      compra: {
        idcompra,
        idprov,
        idusuario,
        fecha,
        total,
        numerocompra,
        productos: productosGuardados,
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear compra:", error);
    res.status(500).json({ error: "No se pudo registrar la compra", detalle: error.message });
  } finally {
    client.release();
  }
};

// ========================
// EDITAR COMPRA EXISTENTE SIN DUPLICAR STOCK
// ========================
exports.editarCompra = async (req, res) => {
  const client = await pool.connect();
  try {
    const { idcompra } = req.params;
    const { idprov, fecha, total, productos } = req.body;

    if (!idprov || !productos || productos.length === 0)
      return res.status(400).json({ error: "Faltan datos de proveedor o productos" });

    await client.query("BEGIN");

    // 1️⃣ Obtener detalle anterior
    const detalleAnterior = await client.query(
      `SELECT idproducto, cantidad FROM detalle_compra WHERE idcompra = $1`,
      [idcompra]
    );

    const stockAnteriorMap = {};
    detalleAnterior.rows.forEach((d) => {
      stockAnteriorMap[d.idproducto] = d.cantidad;
    });

    // 2️⃣ Actualizar compra
    await client.query(
      `UPDATE compra SET idprov=$1, fecha=$2, total=$3 WHERE idcompra=$4`,
      [idprov, fecha || new Date(), total || 0, idcompra]
    );

    // 3️⃣ Eliminar detalle anterior
    await client.query(`DELETE FROM detalle_compra WHERE idcompra=$1`, [idcompra]);

    // 4️⃣ Insertar nuevo detalle y ajustar stock correctamente
    const productosGuardados = [];
    for (const p of productos) {
      let idproducto = p.idproducto;

      if (!idproducto) {
        // Producto nuevo
        const prodRes = await client.query(
          `INSERT INTO producto 
           (codigo, idcategoria, nombre, bulto, detalle, presentacion, observaciones, fecha_vencimiento, stock, idprov, precio_venta)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING idproducto`,
          [
            p.codigo,
            p.idcategoria,
            p.nombre,
            p.bulto || null,
            p.detalle || null,
            p.presentacion || null,
            p.observaciones || null,
            p.fecha_vencimiento || null,
            p.cantidad,
            idprov,
            p.precio_venta || 0,
          ]
        );
        idproducto = prodRes.rows[0].idproducto;
      } else {
        // Ajustar stock y actualizar datos si cambiaron
        const cantidadAnterior = stockAnteriorMap[idproducto] || 0;
        const diferencia = p.cantidad - cantidadAnterior;

        await client.query(
          `UPDATE producto 
           SET stock = stock + $1,
               presentacion = COALESCE($2, presentacion),
               observaciones = COALESCE($3, observaciones),
               precio_venta = COALESCE($4, precio_venta)
           WHERE idproducto = $5`,
          [diferencia, p.presentacion, p.observaciones, p.precio_venta, idproducto]
        );
      }

      // Insertar nuevo detalle
      const detalleRes = await client.query(
        `INSERT INTO detalle_compra (idcompra, idproducto, cantidad, precio_compra, precio_unitario, descuento)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [
          idcompra,
          idproducto,
          p.cantidad,
          (p.precio || 0) * p.cantidad,
          p.precio || 0,
          p.descuento || 0,
        ]
      );

      productosGuardados.push({ idproducto, ...detalleRes.rows[0] });
    }

    await client.query("COMMIT");
    res.json({
      message: "Compra editada correctamente",
      compra: { idcompra, idprov, fecha, total, productos: productosGuardados },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al editar compra:", error);
    res.status(500).json({ error: "No se pudo editar la compra", detalle: error.message });
  } finally {
    client.release();
  }
};

// ========================
// OBTENER COMPRAS
// ========================
exports.obtenerCompras = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.idcompra, c.fecha, c.total,
             pr.nombre AS proveedor,
             u.nombre AS usuario
      FROM compra c
      INNER JOIN proveedor pr ON c.idprov = pr.idprov
      LEFT JOIN usuario u ON c.idusuario = u.idusuario
      ORDER BY c.fecha DESC, c.idcompra DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener compras:", error);
    res.status(500).json({ error: "No se pudieron obtener las compras" });
  }
};
