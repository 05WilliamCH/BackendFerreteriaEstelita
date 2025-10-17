const pool = require("../db");

// ========================
// ABRIR CAJA
// ========================
exports.abrirCaja = async (req, res) => {
  try {
    const { idusuario, monto_inicial } = req.body;

    // Verificar si ya hay una caja abierta
    const abierta = await pool.query(
      "SELECT * FROM caja WHERE estado = TRUE LIMIT 1"
    );

    if (abierta.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe una caja abierta. Debe cerrarla primero." });
    }

    const nuevaCaja = await pool.query(
      `INSERT INTO caja (idusuario, monto_inicial)
       VALUES ($1, $2)
       RETURNING *`,
      [idusuario, monto_inicial]
    );

    res.json({
      message: "Caja abierta correctamente.",
      caja: nuevaCaja.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al abrir la caja." });
  }
};

// ========================
// CERRAR CAJA
// ========================
exports.cerrarCaja = async (req, res) => {
  try {
    const { idusuario, monto_final, observaciones } = req.body;

    const cajaAbierta = await pool.query(
      "SELECT * FROM caja WHERE estado = TRUE ORDER BY idcaja DESC LIMIT 1"
    );

    if (cajaAbierta.rows.length === 0) {
      return res.status(400).json({ error: "No hay caja abierta." });
    }

    const caja = cajaAbierta.rows[0];

    // Calcular diferencia
    const diferencia = parseFloat(monto_final) - (parseFloat(caja.monto_inicial) + parseFloat(caja.total_ventas));

    const cerrar = await pool.query(
      `UPDATE caja
       SET fecha_cierre = NOW(),
           monto_final = $1,
           observaciones = $2,
           estado = FALSE
       WHERE idcaja = $3
       RETURNING *`,
      [monto_final, observaciones || `Diferencia: Q${diferencia.toFixed(2)}`, caja.idcaja]
    );

    res.json({
      message: "Caja cerrada correctamente.",
      caja: cerrar.rows[0],
      diferencia: diferencia.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cerrar la caja." });
  }
};

// ========================
// CONSULTAR ESTADO DE CAJA
// ========================
exports.estadoCaja = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM caja WHERE estado = TRUE ORDER BY idcaja DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.json({ abierta: false });
    }

    res.json({
      abierta: true,
      caja: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar el estado de la caja." });
  }
};

// ========================
// SUMAR VENTA A LA CAJA
// ========================
exports.sumarVenta = async (req, res) => {
  try {
    const { monto } = req.body;

    const abierta = await pool.query(
      "SELECT * FROM caja WHERE estado = TRUE ORDER BY idcaja DESC LIMIT 1"
    );

    if (abierta.rows.length === 0) {
      return res.status(400).json({ error: "No hay caja abierta para registrar la venta." });
    }

    const caja = abierta.rows[0];
    const nuevoTotal = parseFloat(caja.total_ventas) + parseFloat(monto);

    await pool.query(
      "UPDATE caja SET total_ventas = $1 WHERE idcaja = $2",
      [nuevoTotal, caja.idcaja]
    );

    res.json({ message: "Venta registrada en la caja.", total_ventas: nuevoTotal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al sumar venta a la caja." });
  }
};
