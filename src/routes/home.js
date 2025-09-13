const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

/**
 * NOTA: en la ruta que definimos aca abajo
 * Estamos utilizando un middleware personalizado
 * Este middleware es para proteger la ruta
 * Ya que este atrapa el token que se envia en el header
 * Y si es valido, devuelve una respuesta
 */

router.get("/", authorization, async (req, res) => {
  try {
    res.json("Bienvenido Pase Adelante");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Error del servidor");
  }
});

module.exports = router;
