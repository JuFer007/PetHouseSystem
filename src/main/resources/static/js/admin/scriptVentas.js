async function cargarVentas() {
    const res = await fetch("http://localhost:8080/api/ventas");
    const ventas = await res.json();

    const tbody = document.querySelector("#tablaVentas tbody");
    tbody.innerHTML = "";

    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-6 text-gray-500">
                    <i class="fas fa-info-circle mr-2"></i> No hay ventas registradas
                </td>
            </tr>`;
        return;
    }

    ventas.forEach(v => {
        const fecha = new Date(v.fechaVenta).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        // Concatenar productos vendidos
        const productos = v.detalles
            .map(d => `${d.producto.nombre} (x${d.cantidad})`)
            .join(", ");

        tbody.innerHTML += `
            <tr class="border-b border-gray-200">
                <td class="py-4 px-4 font-semibold">00${v.id}</td>
                <td class="py-4 px-4">${v.clienteId}</td>
                <td class="py-4 px-4">${productos}</td>
                <td class="py-4 px-4 font-semibold text-green-600">S/. ${v.total.toFixed(2)}</td>
                <td class="py-4 px-4">${fecha}</td>
            </tr>`;
    });
}

document.addEventListener("DOMContentLoaded", cargarVentas);

async function cargarEstadisticasVentas() {
    const res = await fetch("http://localhost:8080/api/ventas");
    const ventas = await res.json();

    let ventasHoy = 0;
    let totalTransacciones = ventas.length;
    let sumaTotal = 0;

    ventas.forEach(v => {
        sumaTotal += v.total;

        const fechaVenta = v.fechaVenta.split("T")[0];
        const hoy = new Date().toISOString().split("T")[0];
        if (fechaVenta === hoy) {
            ventasHoy += v.total;
        }
    });

    const ticketPromedio = totalTransacciones > 0
        ? (sumaTotal / totalTransacciones) : 0;

    const totalVentasElem = document.querySelector("#ventaHoy");
    if(totalVentasElem) {
        totalVentasElem.textContent = `S/. ${sumaTotal.toFixed(2)}`;
    }

    const totalTransaccionesElem = document.querySelector("#totalTransacciones");
    if(totalTransaccionesElem) {
        totalTransaccionesElem.textContent = totalTransacciones;
    }

    const ticketPromedioElem = document.querySelector("#ticketPromedio");
    if(ticketPromedioElem) {
        ticketPromedioElem.textContent = `S/. ${ticketPromedio.toFixed(2)}`;
    }
}

document.addEventListener("DOMContentLoaded", cargarEstadisticasVentas);
