const express = require('express');
const puppeteer = require('puppeteer');
const { createCanvas } = require('canvas');
const { Chart } = require('chart.js/auto');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

async function generarGraficoVentas(productos) {
    const width = 1200;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const topProductos = productos
        .sort((a, b) => parseFloat(b.ingresoTotal) - parseFloat(a.ingresoTotal))
        .slice(0, 10);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topProductos.map(p => p.nombreProducto),
            datasets: [{
                label: 'Ingresos Totales (S/.)',
                data: topProductos.map(p => parseFloat(p.ingresoTotal)),
                backgroundColor: 'rgba(6, 182, 212, 0.8)',
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Productos por Ingresos',
                    font: { size: 24, weight: 'bold' },
                    color: '#1f2937'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 14 },
                        color: '#4b5563'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ingresos (S/.)',
                        font: { size: 16, weight: 'bold' },
                        color: '#374151'
                    },
                    ticks: {
                        callback: value => 'S/. ' + value.toFixed(2),
                        font: { size: 12 },
                        color: '#6b7280'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    ticks: {
                        font: { size: 12 },
                        color: '#6b7280',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { display: false }
                }
            }
        }
    });

    return canvas.toDataURL();
}

async function generarGraficoUnidades(productos) {
    const width = 1200;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const topProductos = productos
        .sort((a, b) => b.totalVendido - a.totalVendido)
        .slice(0, 10);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: topProductos.map(p => p.nombreProducto),
            datasets: [{
                label: 'Unidades Vendidas',
                data: topProductos.map(p => p.totalVendido),
                backgroundColor: [
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(250, 204, 21, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(156, 163, 175, 0.8)',
                    'rgba(99, 102, 241, 0.8)'
                ],
                borderColor: '#ffffff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Unidades Vendidas',
                    font: { size: 24, weight: 'bold' },
                    color: '#1f2937'
                },
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        font: { size: 12 },
                        color: '#4b5563',
                        padding: 15,
                        boxWidth: 20
                    }
                }
            }
        }
    });

    return canvas.toDataURL();
}

function generarHTMLReporte(productos, graficoVentas, graficoUnidades) {
    const fecha = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const totalIngresos = productos.reduce((sum, p) => sum + parseFloat(p.ingresoTotal), 0);
    const totalUnidades = productos.reduce((sum, p) => sum + p.totalVendido, 0);
    const totalTransacciones = productos.reduce((sum, p) => sum + p.vecesVendido, 0);

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
            }

            .container {
                max-width: 1400px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: white;
                padding: 50px;
                text-align: center;
            }

            .header h1 {
                font-size: 48px;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            }

            .header p {
                font-size: 18px;
                opacity: 0.95;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 30px;
                padding: 50px;
                background: #f9fafb;
            }

            .stat-card {
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                text-align: center;
                border-left: 5px solid #06b6d4;
            }

            .stat-card h3 {
                color: #6b7280;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 15px;
            }

            .stat-card .value {
                color: #06b6d4;
                font-size: 42px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .stat-card .label {
                color: #9ca3af;
                font-size: 14px;
            }

            .graficos {
                padding: 50px;
            }

            .grafico {
                margin-bottom: 60px;
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            }

            .grafico h2 {
                color: #1f2937;
                margin-bottom: 30px;
                font-size: 28px;
                border-bottom: 3px solid #06b6d4;
                padding-bottom: 15px;
            }

            .grafico img {
                width: 100%;
                height: auto;
                border-radius: 10px;
            }

            .tabla-section {
                padding: 50px;
                background: #f9fafb;
            }

            .tabla-section h2 {
                color: #1f2937;
                margin-bottom: 30px;
                font-size: 28px;
                border-bottom: 3px solid #06b6d4;
                padding-bottom: 15px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            }

            thead {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: white;
            }

            th {
                padding: 20px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            td {
                padding: 18px 20px;
                border-bottom: 1px solid #e5e7eb;
                color: #374151;
                font-size: 14px;
            }

            tbody tr:hover {
                background-color: #f3f4f6;
            }

            tbody tr:last-child td {
                border-bottom: none;
            }

            .stock-bajo {
                color: #ef4444;
                font-weight: bold;
            }

            .stock-normal {
                color: #10b981;
            }

            .footer {
                background: #1f2937;
                color: white;
                padding: 30px;
                text-align: center;
            }

            .footer p {
                margin: 5px 0;
                opacity: 0.8;
            }

            .text-right {
                text-align: right;
            }

            .text-center {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🐾 PetHouse</h1>
                <p>Reporte General de Productos y Ventas</p>
                <p style="margin-top: 10px; font-size: 16px;">Generado el ${fecha}</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Ingresos Totales</h3>
                    <div class="value">S/. ${totalIngresos.toFixed(2)}</div>
                    <div class="label">Ventas acumuladas</div>
                </div>
                <div class="stat-card">
                    <h3>Unidades Vendidas</h3>
                    <div class="value">${totalUnidades}</div>
                    <div class="label">Productos entregados</div>
                </div>
                <div class="stat-card">
                    <h3>Transacciones</h3>
                    <div class="value">${totalTransacciones}</div>
                    <div class="label">Ventas realizadas</div>
                </div>
            </div>

            <div class="graficos">
                <div class="grafico">
                    <h2>📊 Análisis de Ingresos por Producto</h2>
                    <img src="${graficoVentas}" alt="Gráfico de Ventas">
                </div>

                <div class="grafico">
                    <h2>📈 Distribución de Ventas</h2>
                    <img src="${graficoUnidades}" alt="Gráfico de Unidades">
                </div>
            </div>

            <div class="tabla-section">
                <h2>📋 Detalle de Productos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th class="text-right">Precio</th>
                            <th class="text-center">Stock</th>
                            <th class="text-center">Vendido</th>
                            <th class="text-center">N° Ventas</th>
                            <th class="text-right">Ingreso Total</th>
                            <th class="text-right">Promedio/Venta</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productos.map(p => `
                            <tr>
                                <td><strong>${p.nombreProducto}</strong></td>
                                <td>${p.categoria}</td>
                                <td class="text-right">S/. ${parseFloat(p.precio).toFixed(2)}</td>
                                <td class="text-center ${p.stockActual <= 5 ? 'stock-bajo' : 'stock-normal'}">
                                    ${p.stockActual}
                                </td>
                                <td class="text-center">${p.totalVendido}</td>
                                <td class="text-center">${p.vecesVendido}</td>
                                <td class="text-right"><strong>S/. ${parseFloat(p.ingresoTotal).toFixed(2)}</strong></td>
                                <td class="text-right">S/. ${parseFloat(p.ingresoPromedioPorVenta).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p><strong>PetHouse - Sistema de Gestión Veterinaria</strong></p>
                <p>Este reporte fue generado automáticamente</p>
                <p style="margin-top: 10px; font-size: 12px;">
                    © ${new Date().getFullYear()} PetHouse. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Endpoint para generar el PDF
app.post('/generar-reporte-productos', async (req, res) => {
    try {
        const { productos } = req.body;

        if (!productos || productos.length === 0) {
            return res.status(400).json({ error: 'No hay datos de productos' });
        }

        console.log('Generando gráficos...');
        const graficoVentas = await generarGraficoVentas(productos);
        const graficoUnidades = await generarGraficoUnidades(productos);

        console.log('Generando HTML...');
        const html = generarHTMLReporte(productos, graficoVentas, graficoUnidades);

        console.log('Iniciando navegador...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        console.log('Generando PDF...');
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        res.contentType('application/pdf');
        res.send(pdf);

        console.log('PDF generado exitosamente');
    } catch (error) {
        console.error('Error generando PDF:', error);
        res.status(500).json({ error: 'Error generando el reporte PDF' });
    }
});

const PORT = 3007;
app.listen(PORT, () => {
    console.log(`Servidor de reportes ejecutándose en puerto ${PORT}`);
    console.log(`Endpoint disponible: http://localhost:${PORT}/generar-reporte-productos`);
});
