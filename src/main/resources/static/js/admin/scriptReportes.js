// ============================================
//  MÓDULO DE REPORTES - ESTADÍSTICAS PRODUCTOS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    cargarReporteProductos();
});


async function cargarReporteProductos() {
    try {

        // 👉 TU ENDPOINT
        const response = await fetch('/api/productos/estadisticas');

        if (!response.ok) {
            throw new Error("Error HTTP: " + response.status);
        }

        const productos = await response.json();

        if (!Array.isArray(productos)) {
            console.error("Error: API no retornó un array:", productos);
            return;
        }

        const tbody = document.querySelector('#tablaEstadisticasProductos tbody');

        if (!tbody) {
            console.error("No se encontró la tabla de reportes");
            return;
        }

        tbody.innerHTML = '';

        productos.forEach(p => {

            const tr = document.createElement('tr');
            tr.classList.add("border-b", "border-gray-200", "hover:bg-gray-50");

            tr.innerHTML = `
                <td class="py-3 px-4 font-semibold">${p.nombreProducto}</td>
                <td class="py-3 px-4">${p.categoria}</td>
                <td class="py-3 px-4 text-right">
                    S/. ${Number(p.precio).toFixed(2)}
                </td>

                <td class="py-3 px-4 text-center
                    ${p.stockActual <= 5 ? 'text-red-500 font-bold' : ''}">
                    ${p.stockActual}
                </td>

                <td class="py-3 px-4 text-center text-green-600 font-semibold">
                    ${p.totalVendido}
                </td>

                <td class="py-3 px-4 text-center">
                    ${p.vecesVendido}
                </td>

                <td class="py-3 px-4 text-right font-bold text-cyan-600">
                    S/. ${Number(p.ingresoTotal).toFixed(2)}
                </td>

                <td class="py-3 px-4 text-right">
                    S/. ${Number(p.ingresoPromedioPorVenta).toFixed(2)}
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error cargando reportes:", error);
    }
}
