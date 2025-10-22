const pool = require("../db");

// ========================
// CREAR NUEVA VENTA COMPLETA
// ========================
exports.crearVenta = async (req, res) => {
  const client = await pool.connect();

  try {
    const { idcliente, idusuario, fecha, productos, montorecibido, vuelto } = req.body;

    // Validación: debe haber productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "Faltan productos para la venta" });
    }

    // ========================
    // 1️⃣ Verificar caja abierta
    // ========================
    const cajaRes = await client.query(
      "SELECT * FROM caja WHERE estado = TRUE ORDER BY idcaja DESC LIMIT 1"
    );
    if (cajaRes.rows.length === 0) {
      return res.status(400).json({ error: "No hay caja abierta. Debe abrir la caja antes de realizar ventas." });
    }
    const idcaja = cajaRes.rows[0].idcaja;

    // ========================
    // 2️⃣ Iniciar transacción
    // ========================
    await client.query("BEGIN");

    // ========================
    // 3️⃣ Calcular total de la venta
    // ========================
    const total = productos.reduce((acc, p) => {
      const subtotal = (p.precio_venta || 0) * (p.cantidad || 0) - (p.descuento || 0);
      return acc + subtotal;
    }, 0);

    // ========================
    // 4️⃣ Generar número de factura
    // ========================
    const numeroFactura = `FAC-${Date.now()}`;

    // ========================
    // 5️⃣ Insertar venta principal
    // ========================
    const ventaRes = await client.query(
      `INSERT INTO venta (idcliente, idusuario, idcaja, fecha, total, numerofactura, montorecibido, vuelto)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING idventa`,
      [
        idcliente || null,
        idusuario || null,
        idcaja,
        fecha || new Date(),
        total,
        numeroFactura,
        montorecibido || total,
        vuelto || (montorecibido ? montorecibido - total : 0)
      ]
    );

    const idventa = ventaRes.rows[0].idventa;

    // ========================
    // 6️⃣ Insertar detalle de productos y actualizar stock
    // ========================
    const productosGuardados = [];

    for (const p of productos) {
      // Insertar detalle
      const detalleRes = await client.query(
        `INSERT INTO detalle_venta (idventa, idproducto, cantidad, precio_venta, descuento)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [idventa, p.idproducto, p.cantidad, p.precio_venta, p.descuento || 0]
      );

      // Actualizar stock
      await client.query(
        `UPDATE producto SET stock = stock - $1 WHERE idproducto = $2`,
        [p.cantidad, p.idproducto]
      );

      // Obtener información del producto
      const productoInfo = await client.query(
        `SELECT nombre, codigo FROM producto WHERE idproducto = $1`,
        [p.idproducto]
      );

      productosGuardados.push({
        ...detalleRes.rows[0],
        nombre: productoInfo.rows[0].nombre,
        codigo: productoInfo.rows[0].codigo
      });
    }

    // ========================
    // 7️⃣ Actualizar total de ventas en la caja
    // ========================
    await client.query(
      "UPDATE caja SET total_ventas = total_ventas + $1 WHERE idcaja = $2",
      [total, idcaja]
    );

    // ========================
    // 8️⃣ Obtener datos del cliente
    // ========================
    const clienteRes = await client.query(
      `SELECT idcliente, nombre, nit, direccion, telefono
       FROM cliente WHERE idcliente = $1`,
      [idcliente]
    );

    const cliente = clienteRes.rows[0] || {
      nombre: "Consumidor Final",
      nit: "CF",
      direccion: "Ciudad",
      telefono: "N/A",
    };

    // ========================
    // 9️⃣ Confirmar transacción
    // ========================
    await client.query("COMMIT");

    // ========================
    // 10️⃣ Respuesta al frontend
    // ========================
    res.status(201).json({
      message: "Venta registrada correctamente",
      venta: {
        idventa,
        numeroFactura,
        fecha: fecha || new Date(),
        total,
        montorecibido: montorecibido || total,
        vuelto: vuelto || (montorecibido ? montorecibido - total : 0),
        cliente,
        productos: productosGuardados,
        idcaja
      },
    });

  } catch (error) {
    await client.query("ROLLBACK"); // Si algo falla, deshace todo
    console.error("Error al crear venta:", error);
    res.status(500).json({ error: "No se pudo registrar la venta", detalle: error.message });
  } finally {
    client.release();
  }
};

// ========================
// OBTENER TODAS LAS VENTAS
// ========================
exports.obtenerVentas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.idventa, v.fecha, v.total, v.numerofactura, v.montorecibido, v.vuelto,
              c.nombre AS cliente, c.nit, c.direccion, c.telefono, v.idcaja
       FROM venta v
       LEFT JOIN cliente c ON v.idcliente = c.idcliente
       ORDER BY v.fecha DESC, v.idventa DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "No se pudieron obtener las ventas" });
  }
};

// ========================
// OBTENER DETALLE DE UNA VENTA
// ========================
exports.obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT dv.iddetalle_venta, p.nombre, p.codigo, dv.cantidad, dv.precio_venta, dv.descuento
       FROM detalle_venta dv
       INNER JOIN producto p ON dv.idproducto = p.idproducto
       WHERE dv.idventa = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalle de venta:", error);
    res.status(500).json({ error: "No se pudo obtener el detalle de la venta" });
  }
};
