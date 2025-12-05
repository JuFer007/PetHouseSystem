document.addEventListener('DOMContentLoaded', () => {
    cargarReporteProductos();
});

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

    } catch (error) {
        console.error("Error cargando reportes:", error);
    }
}

async function exportarPDF() {
    if (!window.productosReporte) {
        showToast('error', 'Sin datos', 'No hay datos para exportar');
        return;
    }

    try {
        const response = await fetch('http://localhost:3007/generar-reporte-productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productos: window.productosReporte })
        });

        if (!response.ok) throw new Error('Error generando PDF');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-productos-${new Date().getTime()}.pdf`;
        a.click();

        showToast('success', 'PDF Generado', 'El reporte se descargó correctamente');
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudo generar el PDF');
    }
}
