const pool = require('../db');

// Obtener todos los clientes
exports.obtenerClientes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cliente ORDER BY idcliente ASC');
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

// Crear cliente
exports.crearCliente = async (req, res) => {
  const { nombre, telefono, direccion, email, nit } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });
  try {
    const result = await pool.query(
      'INSERT INTO cliente(nombre, telefono, direccion, email, nit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, telefono, direccion, email, nit]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

// Actualizar cliente
exports.actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion, email, nit } = req.body;
  if (!nombre) return res.status(400).json({ error: "El nombre es obligatorio" });
  try {
    const result = await pool.query(
      'UPDATE cliente SET nombre=$1, telefono=$2, direccion=$3, email=$4, nit=$5 WHERE idcliente=$6 RETURNING *',
      [nombre, telefono, direccion, email, nit, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cliente WHERE idcliente=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};
