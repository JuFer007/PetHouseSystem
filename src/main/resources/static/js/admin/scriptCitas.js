const apiUrl = "http://localhost:8080/api/citas";

const tablaCitas = document.querySelector("#citas tbody");
const pendientesCounter = document.querySelector("#citas .stat-card:nth-child(1) h3");
const completadasCounter = document.querySelector("#citas .stat-card:nth-child(2) h3");
const canceladasCounter = document.querySelector("#citas .stat-card:nth-child(3) h3");

async function cargarCitas() {
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Error al obtener las citas");

        const citas = await res.json();      // ✅ primero obtienes las citas

        await validarVencimientoCitas(citas); // ✅ ahora sí existe

        tablaCitas.innerHTML = "";

        let pendientes = 0;
        let completadas = 0;
        let canceladas = 0;

        citas.forEach(cita => {
            const estado = (cita.estado || "").toLowerCase();

            switch (estado) {
                case "pendiente":  pendientes++; break;
                case "completada": completadas++; break;
                case "cancelada":  canceladas++; break;
            }

            const row = document.createElement("tr");
            row.classList.add("table-row", "border-b", "border-gray-200");

            row.innerHTML = `
                <td class="py-4 px-4">${cita.cliente?.nombre || '-'}</td>
                <td class="py-4 px-4">${cita.mascota?.nombre || '-'}</td>
                <td class="py-4 px-4">${cita.motivo || cita.servicio?.nombre || '-'}</td>
                <td class="py-4 px-4">
                    ${cita.fecha
                        ? new Date(cita.fecha + "T" + (cita.hora || "00:00")).toLocaleString()
                        : "-"
                    }
                </td>
                <td class="py-4 px-4">
                    <span class="status-badge ${
                        estado === 'completada' ? 'status-completed' :
                        estado === 'pendiente'  ? 'status-pending' :
                        estado === 'cancelada'  ? 'status-cancelled' : ''
                    }">
                        ${cita.estado || '-'}
                    </span>
                </td>
                <td class="py-3 px-3 flex space-x-3">
                    <button class="text-yellow-500 hover:text-yellow-700 ${
                        estado === 'cancelada' ? 'opacity-40 cursor-not-allowed' : ''
                    }"
                    ${estado === 'cancelada' ? 'disabled' : ''}
                    onclick="cambiarEstado(${cita.id}, '${estado}')">
                        <i class="fas fa-sync-alt"></i>
                    </button>

                    <button class="text-red-500 hover:text-red-700"
                            onclick="eliminarCita(${cita.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tablaCitas.appendChild(row);
        });

        pendientesCounter.textContent  = pendientes;
        completadasCounter.textContent = completadas;
        canceladasCounter.textContent  = canceladas;

    } catch (error) {
        console.error("Error al cargar citas:", error);
    }
}

async function eliminarCita(id) {
    if (!confirm("¿Deseas eliminar esta cita?")) return;

    try {
        const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("No se pudo eliminar la cita");

        showToast("success", "Cita eliminada", "La cita se eliminó correctamente.");
        cargarCitas();
    } catch (error) {
        console.error(error);
        showToast("error", "Error", "No se pudo eliminar la cita.");
    }
}

async function cambiarEstado(id, estadoActual) {
    try {
        if (estadoActual === "cancelada") {
            showToast("error", "Acción no permitida", "Las citas CANCELADAS no pueden cambiar de estado.");
            return;
        }

        const resGet = await fetch(`${apiUrl}/${id}`);
        if (!resGet.ok) throw new Error("No se pudo obtener la cita");
        const cita = await resGet.json();

        let nuevoEstado;

        if (estadoActual === "pendiente") {
            nuevoEstado = "COMPLETADA";
        } else if (estadoActual === "completada") {
            nuevoEstado = "CANCELADA";
        } else {
            nuevoEstado = estadoActual;
        }

        const resPut = await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...cita, estado: nuevoEstado })
        });

        if (!resPut.ok) throw new Error("No se pudo actualizar el estado");

        showToast("success", "Estado actualizado", `Se cambió el estado a "${nuevoEstado}".`);
        cargarCitas();
        mostrarPagos();

    } catch (error) {
        console.error(error);
        showToast("error", "Error", "No se pudo cambiar el estado de la cita.");
    }
}

document.addEventListener("DOMContentLoaded", cargarCitas);

async function mostrarPagos() {
    const pagos = await cargarPagos();
    console.log(pagos);
}

async function validarVencimientoCitas(citas) {

    const ahora = new Date();
    const toleranciaMin = 20;

    for (const cita of citas) {

        const estado = (cita.estado || "").toLowerCase();

        if (estado !== "pendiente") continue;
        if (!cita.fecha || !cita.hora) continue;

        const fechaHoraCita = new Date(`${cita.fecha}T${cita.hora}`);

        const limite = new Date(fechaHoraCita.getTime() + toleranciaMin * 60000);

        if (ahora > limite) {

            try {
                await fetch(`${apiUrl}/${cita.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...cita,
                        estado: "CANCELADA"
                    })
                });

            } catch (err) {
                console.error(`Error cancelando cita ${cita.id}`, err);
            }
        }
    }
}
