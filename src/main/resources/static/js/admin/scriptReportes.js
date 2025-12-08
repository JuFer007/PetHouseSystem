document.addEventListener('DOMContentLoaded', () => {
    cargarReporteProductos();
    crearGraficos();
});

let chartVentas = null;
let chartUnidades = null;

async function cargarReporteProductos() {
    try {
        const response = await fetch('/api/productos/estadisticas');
        if (!response.ok) throw new Error("Error HTTP: " + response.status);

        const productos = await response.json();
        const tbody = document.querySelector('#tablaEstadisticasProductos tbody');
        tbody.innerHTML = '';

        productos.forEach(p => {
            const tr = document.createElement('tr');
            tr.classList.add("border-b", "border-gray-200", "hover:bg-gray-50");
            tr.innerHTML = `
                <td class="py-2 px-3 font-semibold text-sm">${p.nombreProducto}</td>
                <td class="py-2 px-3 text-sm">${p.categoria}</td>
                <td class="py-2 px-3 text-right text-sm">S/. ${Number(p.precio).toFixed(2)}</td>
                <td class="py-2 px-3 text-center text-sm ${p.stockActual <= 5 ? 'text-red-500 font-bold' : ''}">
                    ${p.stockActual}
                </td>
                <td class="py-2 px-3 text-center text-green-600 font-semibold text-sm">${p.totalVendido}</td>
                <td class="py-2 px-3 text-center text-sm">${p.vecesVendido}</td>
                <td class="py-2 px-3 text-right font-bold text-cyan-600 text-sm">S/. ${Number(p.ingresoTotal).toFixed(2)}</td>
                <td class="py-2 px-3 text-right text-sm">S/. ${Number(p.ingresoPromedioPorVenta).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });

        window.productosReporte = productos;
        actualizarGraficos(productos);

    } catch (error) {
        console.error("Error cargando reportes:", error);
    }
}

function crearGraficos() {
    const ctxVentas = document.getElementById('graficoVentas');
    if (ctxVentas) {
        chartVentas = new Chart(ctxVentas.getContext('2d'), {
            type: 'bar',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: true, text: 'Top 10 Productos por Ingresos', font: { size: 16, weight: 'bold' } }
                }
            }
        });
    }

    const ctxUnidades = document.getElementById('graficoUnidades');
    if (ctxUnidades) {
        chartUnidades = new Chart(ctxUnidades.getContext('2d'), {
            type: 'doughnut',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'right' },
                    title: { display: true, text: 'Distribución de Unidades Vendidas', font: { size: 16, weight: 'bold' } }
                }
            }
        });
    }
}

function actualizarGraficos(productos) {
    const top10 = productos
        .sort((a, b) => parseFloat(b.ingresoTotal) - parseFloat(a.ingresoTotal))
        .slice(0, 10);

    if (chartVentas) {
        chartVentas.data = {
            labels: top10.map(p => p.nombreProducto),
            datasets: [{
                label: 'Ingresos (S/.)',
                data: top10.map(p => parseFloat(p.ingresoTotal)),
                backgroundColor: 'rgba(6, 182, 212, 0.7)',
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 2
            }]
        };
        chartVentas.update();
    }

   if (chartUnidades) {
       chartUnidades.data = {
           labels: top10.map(p => p.nombreProducto),
           datasets: [{
               data: top10.map(p => p.totalVendido),
               backgroundColor: [
                   'rgba(0, 255, 255, 0.8)',
                   'rgba(0, 206, 209, 0.8)',
                   'rgba(64, 224, 208, 0.8)',
                   'rgba(175, 238, 238, 0.8)',
                   'rgba(0, 191, 255, 0.8)',
                   'rgba(135, 206, 250, 0.8)',
                   'rgba(176, 224, 230, 0.8)',
                   'rgba(173, 216, 230, 0.8)',
                   'rgba(224, 255, 255, 0.8)',
                   'rgba(95, 158, 160, 0.8)'
               ]
           }]
       };
       chartUnidades.update();
   }
}

function filtrarProductos() {
    const categoria = document.getElementById('filtroCategoria').value;
    const busqueda = document.getElementById('busquedaProducto')?.value.toLowerCase() || '';

    let productosFiltrados = [...window.productosReporte];

    if (categoria !== 'todos') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === categoria);
    }

    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p =>
            p.nombreProducto.toLowerCase().includes(busqueda)
        );
    }

    const tbody = document.querySelector('#tablaEstadisticasProductos tbody');
    tbody.innerHTML = '';

    productosFiltrados.forEach(p => {
        const tr = document.createElement('tr');
        tr.classList.add("border-b", "border-gray-200", "hover:bg-gray-50");
        tr.innerHTML = `
            <td class="py-2 px-3 font-semibold text-sm">${p.nombreProducto}</td>
            <td class="py-2 px-3 text-sm">${p.categoria}</td>
            <td class="py-2 px-3 text-right text-sm">S/. ${Number(p.precio).toFixed(2)}</td>
            <td class="py-2 px-3 text-center text-sm ${p.stockActual <= 5 ? 'text-red-500 font-bold' : ''}">${p.stockActual}</td>
            <td class="py-2 px-3 text-center text-green-600 font-semibold text-sm">${p.totalVendido}</td>
            <td class="py-2 px-3 text-center text-sm">${p.vecesVendido}</td>
            <td class="py-2 px-3 text-right font-bold text-cyan-600 text-sm">S/. ${Number(p.ingresoTotal).toFixed(2)}</td>
            <td class="py-2 px-3 text-right text-sm">S/. ${Number(p.ingresoPromedioPorVenta).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function exportarPDF() {
    if (!window.productosReporte || window.productosReporte.length === 0) {
        showToast('error', 'Sin datos', 'No hay datos para exportar');
        return;
    }

    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.7); z-index: 9999;
                    display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
                <i class="fas fa-spinner fa-spin text-5xl text-cyan-500 mb-4"></i>
                <p class="text-xl font-semibold text-gray-800">Generando reporte PDF...</p>
                <p class="text-gray-600 mt-2">Por favor espere un momento</p>
            </div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    try {
        const canvasVentas = document.getElementById('graficoVentas');
        const canvasUnidades = document.getElementById('graficoUnidades');

        if (!canvasVentas || !canvasUnidades) {
            throw new Error('No se encontraron los gráficos');
        }

        const graficoVentasBase64 = canvasVentas.toDataURL('image/png', 1.0);
        const graficoIngresosBase64 = canvasUnidades.toDataURL('image/png', 1.0);

        const productosParaPDF = window.productosReporte.map(p => ({
            nombre: p.nombreProducto,
            categoria: p.categoria,
            precio: parseFloat(p.precio),
            stockActual: parseInt(p.stockActual),
            totalVendido: parseInt(p.totalVendido),
            numVentas: parseInt(p.vecesVendido),
            ingresoTotal: parseFloat(p.ingresoTotal)
        }));

        const totales = {
            totalVendido: productosParaPDF.reduce((sum, p) => sum + p.totalVendido, 0),
            totalVentas: productosParaPDF.reduce((sum, p) => sum + p.numVentas, 0),
            ingresoTotal: productosParaPDF.reduce((sum, p) => sum + p.ingresoTotal, 0)
        };

        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        const fechaInicio = primerDiaMes.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const fechaFin = hoy.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const payload = {
            titulo: "Reporte de Ventas de Productos",
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            productos: productosParaPDF,
            graficoVentas: graficoVentasBase64,
            graficoIngresos: graficoIngresosBase64,
            totales: totales
        };

        const response = await fetch('http://localhost:3007/generar-reporte-productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al generar el PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        window.open(url, '_blank');
        
        showToast('success', 'PDF Generado', 'El reporte se abrió en una nueva pestaña');

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        showToast('error', 'Error', 'No se pudo generar el PDF: ' + error.message);
    } finally {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }
}

async function exportarPDFDescarga() {
    if (!window.productosReporte || window.productosReporte.length === 0) {
        showToast('error', 'Sin datos', 'No hay datos para exportar');
        return;
    }

    try {
        showToast('info', 'Generando PDF', 'Por favor espera...');

        const canvasVentas = document.getElementById('graficoVentas');
        const canvasUnidades = document.getElementById('graficoUnidades');

        const productosParaPDF = window.productosReporte.map(p => ({
            nombre: p.nombreProducto,
            categoria: p.categoria,
            precio: parseFloat(p.precio),
            stockActual: parseInt(p.stockActual),
            totalVendido: parseInt(p.totalVendido),
            numVentas: parseInt(p.vecesVendido),
            ingresoTotal: parseFloat(p.ingresoTotal)
        }));

        const totales = {
            totalVendido: productosParaPDF.reduce((sum, p) => sum + p.totalVendido, 0),
            totalVentas: productosParaPDF.reduce((sum, p) => sum + p.numVentas, 0),
            ingresoTotal: productosParaPDF.reduce((sum, p) => sum + p.ingresoTotal, 0)
        };

        const hoy = new Date();
        const payload = {
            titulo: "Reporte de Ventas de Productos",
            fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toLocaleDateString('es-PE'),
            fechaFin: hoy.toLocaleDateString('es-PE'),
            productos: productosParaPDF,
            graficoVentas: canvasVentas.toDataURL('image/png', 1.0),
            graficoIngresos: canvasUnidades.toDataURL('image/png', 1.0),
            totales: totales
        };

        const response = await fetch('http://localhost:3007/generar-reporte-productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Error generando PDF');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-productos-${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('success', 'PDF Generado', 'El reporte se descargó correctamente');
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudo generar el PDF');
    }
}
