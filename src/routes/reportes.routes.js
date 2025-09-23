// backend/routes/reportes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const PDFDocument = require("pdfkit");

// POST /api/reportes/pdf
router.post("/pdf", async (req, res) => {
  try {
    const {
      informe,
      fechaInicio,
      fechaFin,
      categoria,
      producto,
      cliente,
      proveedor,
      masVendidos,
      stock,
    } = req.body;

    // =========================
    // Usamos el mismo query del endpoint normal
    // =========================
    let query = "";
    let condiciones = [];
    let params = [];

    if (informe === "ventas") {
      query = `
        SELECT v.idventa, v.fecha, c.nombre AS cliente, p.nombre AS producto,
               dv.cantidad, dv.precio_venta, dv.descuento
        FROM venta v
        JOIN detalle_venta dv ON v.idventa = dv.idventa
        JOIN producto p ON dv.idproducto = p.idproducto
        JOIN cliente c ON v.idcliente = c.idcliente
        WHERE 1=1
      `;
      if (fechaInicio) { condiciones.push(`v.fecha >= $${condiciones.length + 1}`); params.push(fechaInicio); }
      if (fechaFin) { condiciones.push(`v.fecha <= $${condiciones.length + 1}`); params.push(fechaFin); }
      if (categoria) { condiciones.push(`p.idcategoria = $${condiciones.length + 1}`); params.push(categoria); }
      if (producto) { condiciones.push(`p.idproducto = $${condiciones.length + 1}`); params.push(producto); }
      if (cliente) { condiciones.push(`c.idcliente = $${condiciones.length + 1}`); params.push(cliente); }
      if (stock) {
        if (stock === "bajo") condiciones.push("p.stock < 10");
        else if (stock === "agotado") condiciones.push("p.stock = 0");
        else if (stock === "disponible") condiciones.push("p.stock > 0");
      }
      if (masVendidos) {
        if (masVendidos === "top5") query += " ORDER BY dv.cantidad DESC LIMIT 5";
        if (masVendidos === "top10") query += " ORDER BY dv.cantidad DESC LIMIT 10";
      }
    } else if (informe === "compras") {
      query = `
        SELECT c.idcompra, c.fecha, prov.nombre AS proveedor, p.nombre AS producto,
               dc.cantidad, dc.precio_compra, dc.descuento
        FROM compra c
        JOIN detalle_compra dc ON c.idcompra = dc.idcompra
        JOIN producto p ON dc.idproducto = p.idproducto
        JOIN proveedor prov ON c.idprov = prov.idprov
        WHERE 1=1
      `;
      if (fechaInicio) { condiciones.push(`c.fecha >= $${condiciones.length + 1}`); params.push(fechaInicio); }
      if (fechaFin) { condiciones.push(`c.fecha <= $${condiciones.length + 1}`); params.push(fechaFin); }
      if (categoria) { condiciones.push(`p.idcategoria = $${condiciones.length + 1}`); params.push(categoria); }
      if (producto) { condiciones.push(`p.idproducto = $${condiciones.length + 1}`); params.push(producto); }
      if (proveedor) { condiciones.push(`prov.idprov = $${condiciones.length + 1}`); params.push(proveedor); }
      if (stock) {
        if (stock === "bajo") condiciones.push("p.stock < 10");
        else if (stock === "agotado") condiciones.push("p.stock = 0");
        else if (stock === "disponible") condiciones.push("p.stock > 0");
      }
    } else {
      return res.status(400).json({ error: "Informe no válido" });
    }

    if (condiciones.length > 0) query += " AND " + condiciones.join(" AND ");

    const result = await pool.query(query, params);
    const data = result.rows;

    // =========================
    // Crear PDF
    // =========================
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    
    // Configurar headers de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Reporte.pdf`);
    doc.pipe(res);

    // Título
    doc.fontSize(18).text(`Reporte: ${informe.toUpperCase()}`, { align: "center" });
    doc.moveDown();

    // Filtros
    doc.fontSize(10).text(`Fecha: ${fechaInicio || "-"} al ${fechaFin || "-"}`);
    if (categoria) doc.text(`Categoría: ${categoria}`);
    if (producto) doc.text(`Producto: ${producto}`);
    if (cliente) doc.text(`Cliente: ${cliente}`);
    if (proveedor) doc.text(`Proveedor: ${proveedor}`);
    doc.moveDown();

    // Tabla
    const columnas = data.length > 0 ? Object.keys(data[0]) : [];
    const cellWidth = 520 / columnas.length;

    // Header de tabla
    columnas.forEach(col => {
      doc.font("Helvetica-Bold").text(col.toUpperCase(), { width: cellWidth, continued: true });
    });
    doc.moveDown(0.5);

    // Filas
    data.forEach(fila => {
      columnas.forEach(col => {
        doc.font("Helvetica").text(fila[col]?.toString() || "-", { width: cellWidth, continued: true });
      });
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

module.exports = router;
