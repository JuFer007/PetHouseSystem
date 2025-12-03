const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/recursos', express.static(path.join(__dirname, 'recursos')));
app.use('/', express.static(path.join(__dirname, 'templates')));

app.post("/generar-ticket-vet", async (req, res) => {
  try {
    const {
      cliente,
      fecha,
      hora,
      numeroAtencion,
      dni,
      telefono,
      nombreMascota,
      especie,
      raza,
      edad,
      peso,
      veterinario,
      servicios,
      metodoPago,
      observaciones,
      subtotal,
      descuento,
      total,
      proximaCita
    } = req.body;

    // Validaciones
    if (!servicios || servicios.length === 0) {
      return res.status(400).json({
        error: "Debe incluir al menos un servicio"
      });
    }

    const templatePath = path.join(__dirname, "templates", "ticketVet.html");

    if (!fs.existsSync(templatePath)) {
      throw new Error("Template ticketVet.html no encontrado");
    }

    let template = fs.readFileSync(templatePath, "utf8");

    // Generar HTML de los servicios
    const serviciosHTML = servicios.map(servicio => {
      const monto = servicio.monto || servicio.precio || 0;
      const fechaServicio = servicio.fecha || '';

      return `
        <div class="servicio">
            <div class="concepto">
                ${servicio.concepto || servicio.nombre}
                ${fechaServicio ? `<div class="fecha-servicio">${fechaServicio}</div>` : ''}
            </div>
            <div class="monto"><span class="moneda">S/.</span>${monto.toFixed(2)}</div>
        </div>`;
    }).join("");

    template = template
      .replace("{{numeroAtencion}}", numeroAtencion || "000001")
      .replace("{{fecha}}", fecha || new Date().toLocaleDateString('es-PE'))
      .replace("{{hora}}", hora || new Date().toLocaleTimeString('es-PE'))
      .replace("{{cliente}}", cliente || "Cliente General")
      .replace("{{dni}}", dni || "N/A")
      .replace("{{telefono}}", telefono || "N/A")
      .replace("{{nombreMascota}}", nombreMascota || "N/A")
      .replace("{{especie}}", especie || "N/A")
      .replace("{{raza}}", raza || "N/A")
      .replace("{{edad}}", edad || "N/A")
      .replace("{{peso}}", peso || "N/A")
      .replace("{{veterinario}}", veterinario || "N/A")
      .replace("{{servicios}}", serviciosHTML)
      .replace("{{metodoPago}}", metodoPago || "Efectivo")
      .replace("{{observaciones}}", observaciones || "Ninguna")
      .replace("{{subtotal}}", (subtotal || 0).toFixed(2))
      .replace("{{descuento}}", (descuento || 0).toFixed(2))
      .replace("{{total}}", (total || 0).toFixed(2))

    console.log(`Generando ticket veterinario #${numeroAtencion}...`);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setContent(template, { waitUntil: "networkidle0" });

    const height = await page.evaluate(() => {
      return document.documentElement.scrollHeight + 'px';
    });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: "80mm",
      height,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm"
      }
    });

    await browser.close();

    console.log(`Ticket veterinario #${numeroAtencion} generado exitosamente`);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=ticket_vet_${numeroAtencion || "000001"}.pdf`,
      "Content-Length": pdfBuffer.length
    });
    res.end(pdfBuffer);

  } catch (err) {
    console.error("Error generando ticket veterinario:", err);
    res.status(500).json({
      error: "Error generando el ticket",
      details: err.message
    });
  }
});

// Endpoint para generar ticket de restaurante (mantener el original)
app.post("/generar-ticket", async (req, res) => {
  try {
    const {
      cliente,
      fecha,
      hora,
      mesero,
      ticketNumero,
      numeroMesa,
      platos,
      subtotal,
      descuento,
      total,
      dni
    } = req.body;

    if (!platos || platos.length === 0) {
      return res.status(400).json({
        error: "Debe incluir al menos un plato"
      });
    }

    const templatePath = path.join(__dirname, "templates", "ticket.html");

    if (!fs.existsSync(templatePath)) {
      throw new Error("Template ticket.html no encontrado");
    }

    let template = fs.readFileSync(templatePath, "utf8");

    // Generar HTML de los platos
    const platosHTML = platos.map(plato => {
      const cantidad = plato.cantidad || 1;
      const precio = plato.precio || plato.precioPlato || 0;
      const importe = cantidad * precio;

      return `
        <div class="servicio">
            <div class="descripcion">${plato.nombre || plato.nombrePlato}</div>
            <div class="cantidad">${cantidad}</div>
            <div class="precio"><span class="moneda">S/.</span>${importe.toFixed(2)}</div>
        </div>`;
    }).join("");

    // Reemplazar placeholders
    template = template
      .replace("{{cliente}}", cliente || "Cliente General")
      .replace("{{fecha}}", fecha || new Date().toLocaleDateString('es-PE'))
      .replace("{{hora}}", hora || new Date().toLocaleTimeString('es-PE'))
      .replace("{{mesero}}", mesero || "N/A")
      .replace("{{numeroMesa}}", numeroMesa || "N/A")
      .replace("{{ticketNumero}}", ticketNumero || "000001")
      .replace("{{dni}}", dni || "N/A")
      .replace("{{servicios}}", platosHTML)
      .replace("{{subtotal}}", (subtotal || 0).toFixed(2))
      .replace("{{descuento}}", (descuento || 0).toFixed(2))
      .replace("{{total}}", (total || 0).toFixed(2));

    // Generar PDF con Puppeteer
    console.log(`Generando ticket #${ticketNumero}...`);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    await page.setContent(template, { waitUntil: "networkidle0" });

    const height = await page.evaluate(() => {
      return document.documentElement.scrollHeight + 'px';
    });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: "80mm",
      height,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm"
      }
    });

    await browser.close();

    console.log(`Ticket #${ticketNumero} generado exitosamente`);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=ticket_${ticketNumero || "000001"}.pdf`,
      "Content-Length": pdfBuffer.length
    });
    res.end(pdfBuffer);

  } catch (err) {
    console.error("Error generando ticket:", err);
    res.status(500).json({
      error: "Error generando el ticket",
      details: err.message
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Ticket Generator (Restaurante & Veterinaria)",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Servicio de Generación de Tickets",
    endpoints: {
      health: "GET /health",
      generateRestaurant: "POST /generar-ticket",
      generateVet: "POST /generar-ticket-vet"
    }
  });
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
