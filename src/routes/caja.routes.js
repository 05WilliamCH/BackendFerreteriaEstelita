const express = require("express");
const router = express.Router();
const cajaController = require("../controllers/caja.controller");

router.post("/abrir", cajaController.abrirCaja);
router.post("/cerrar", cajaController.cerrarCaja);
router.get("/estado", cajaController.estadoCaja);
router.post("/sumarVenta", cajaController.sumarVenta);

router.get("/reporte", cajaController.reporteCajas);
router.get("/reporte/fechas", cajaController.reporteCajasPorFechas);


module.exports = router;
