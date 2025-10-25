const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get("/datos", dashboardController.obtenerDatosDashboard);


module.exports = router;
