const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/recursos', express.static(path.join(__dirname, 'recursos')));
app.use('/', express.static(path.join(__dirname, 'templates')));

app.post("/generar-reporte-productos", async (req, res) => {
  try {
    const {
      titulo,
      fechaInicio,
      fechaFin,
      productos,
      graficoVentas,
      graficoIngresos,
      totales
    } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({
        error: "Debe incluir al menos un producto"
      });
    }

    const templatePath = path.join(__dirname, "templates", "reporteProductos.html");

    if (!fs.existsSync(templatePath)) {
      throw new Error("Template reporteProductos.html no encontrado");
    }

    let template = fs.readFileSync(templatePath, "utf8");

    const productosHTML = productos.map((producto, index) => {
      const totalVendido = producto.totalVendido || 0;
      const numVentas = producto.numVentas || 0;
      const ingresoTotal = producto.ingresoTotal || 0;
      const promedioVenta = numVentas > 0 ? (ingresoTotal / numVentas) : 0;

      return `
        <tr class="${index % 2 === 0 ? 'fila-par' : 'fila-impar'}">
          <td>${producto.nombre || 'N/A'}</td>
          <td>${producto.categoria || 'N/A'}</td>
          <td class="text-right">S/. ${(producto.precio || 0).toFixed(2)}</td>
          <td class="text-center">${producto.stockActual || 0}</td>
          <td class="text-center">${totalVendido}</td>
          <td class="text-center">${numVentas}</td>
          <td class="text-right">S/. ${ingresoTotal.toFixed(2)}</td>
          <td class="text-right">S/. ${promedioVenta.toFixed(2)}</td>
        </tr>`;
    }).join("");

    const totalesCalculados = totales || {
      totalVendido: productos.reduce((sum, p) => sum + (p.totalVendido || 0), 0),
      totalVentas: productos.reduce((sum, p) => sum + (p.numVentas || 0), 0),
      ingresoTotal: productos.reduce((sum, p) => sum + (p.ingresoTotal || 0), 0)
    };

    const totalesHTML = `
      <tr class="fila-total">
        <td colspan="4" class="text-right"><strong>TOTALES:</strong></td>
        <td class="text-center"><strong>${totalesCalculados.totalVendido}</strong></td>
        <td class="text-center"><strong>${totalesCalculados.totalVentas}</strong></td>
        <td class="text-right"><strong>S/. ${totalesCalculados.ingresoTotal.toFixed(2)}</strong></td>
        <td class="text-right"><strong>S/. ${(totalesCalculados.ingresoTotal / (totalesCalculados.totalVentas || 1)).toFixed(2)}</strong></td>
      </tr>`;

    const graficoVentasHTML = graficoVentas
      ? `<div class="grafico">
           <h3>Gráfico de Ventas</h3>
           <img src="${graficoVentas}" alt="Gráfico de Ventas">
         </div>`
      : '';

    const graficoIngresosHTML = graficoIngresos
      ? `<div class="grafico">
           <h3>Gráfico de Ingresos</h3>
           <img src="${graficoIngresos}" alt="Gráfico de Ingresos">
         </div>`
      : '';

    template = template
      .replace("{{titulo}}", titulo || "Reporte de Productos")
      .replace("{{fechaInicio}}", fechaInicio || "N/A")
      .replace("{{fechaFin}}", fechaFin || new Date().toLocaleDateString('es-PE'))
      .replace("{{fechaGeneracion}}", new Date().toLocaleDateString('es-PE'))
      .replace("{{horaGeneracion}}", new Date().toLocaleTimeString('es-PE'))
      .replace("{{productos}}", productosHTML)
      .replace("{{totales}}", totalesHTML)
      .replace("{{graficoVentas}}", graficoVentasHTML)
      .replace("{{graficoIngresos}}", graficoIngresosHTML);

    console.log("Generando reporte de productos...");

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setContent(template, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        bottom: "15mm",
        left: "10mm",
        right: "10mm"
      }
    });

    await browser.close();

    console.log("Reporte generado exitosamente");

    const filename = `reporte_productos_${Date.now()}.pdf`;

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${filename}`,
      "Content-Length": pdfBuffer.length
    });
    res.end(pdfBuffer);

  } catch (err) {
    console.error("Error generando reporte:", err);
    res.status(500).json({
      error: "Error generando el reporte",
      details: err.message
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Reporte Generator",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Servicio de Generación de Reportes",
    endpoints: {
      health: "GET /health",
      generateReport: "POST /generar-reporte-productos"
    }
  });
});

const PORT = 3007;
app.listen(PORT, () => {
  console.log(`Servidor de reportes corriendo en puerto ${PORT}`);
});
