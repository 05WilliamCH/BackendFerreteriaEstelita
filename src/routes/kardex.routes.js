// routes/kardexRoutes.js
const express = require("express");
const router = express.Router();
const { obtenerKardex } = require("../controllers/kardex.controller");

router.get("/", obtenerKardex);

module.exports = router;
