const pool = require("../db");

// ========================
// CREAR NUEVA VENTA
// ========================
exports.crearVenta = async (req, res) => {
  const client = await pool.connect();
  try {
    const { idcliente, fecha, productos, montorecibido, vuelto } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "Faltan productos para la venta" });
    }

    await client.query("BEGIN");

    // Calcular total de la venta
    const total = productos.reduce((acc, p) => {
      const subtotal = (p.precio_venta || 0) * (p.cantidad || 0) - (p.descuento || 0);
      return acc + subtotal;
    }, 0);

    // Generar número de factura
    const numeroFactura = `FAC-${Date.now()}`; // ejemplo simple, puedes ajustar el formato

    // Insertar venta
    const ventaRes = await client.query(
      `INSERT INTO venta (idcliente, fecha, total, numeroFactura, montorecibido, vuelto)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING idventa`,
      [
        idcliente || null,
        fecha || new Date(),
        total,
        numeroFactura,
        montorecibido || total,
        vuelto || (montorecibido ? montorecibido - total : 0)
      ]
    );

    const idventa = ventaRes.rows[0].idventa;

    // Insertar detalles de la venta
    const productosGuardados = [];
    for (const p of productos) {
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

      // Obtener nombre y código del producto
      const productoInfo = await client.query(
        `SELECT nombre, codigo FROM producto WHERE idproducto = $1`,
        [p.idproducto]
      );

      productosGuardados.push({
        ...detalleRes.rows[0],
        nombre: productoInfo.rows[0].nombre,
        codigo: productoInfo.rows[0].codigo,
      });
    }

    // Obtener datos completos del cliente
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

    await client.query("COMMIT");

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
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");
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
      `SELECT v.idventa, v.fecha, v.total, v.numeroFactura, v.montorecibido, v.vuelto,
              c.nombre AS cliente, c.nit, c.direccion, c.telefono
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
      `SELECT dv.iddetalle_venta, p.nombre, dv.cantidad, dv.precio_venta, dv.descuento
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
