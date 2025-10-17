const express = require("express");
const router = express.Router();
const { obtenerReporteVentas } = require("../controllers/reporteventa.controller");

router.get("/", obtenerReporteVentas);

module.exports = router;
