const express = require("express");
const router = express.Router();
const { obtenerReporteCompras } = require("../controllers/reportecompra.controller");

router.get("/", obtenerReporteCompras);

module.exports = router;
