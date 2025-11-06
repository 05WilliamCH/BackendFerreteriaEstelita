const express = require("express");
const router = express.Router();
const reporteController = require("../controllers/reportedevoluciones.controller");

router.get("/", reporteController.obtenerReporteDevoluciones);

module.exports = router;
