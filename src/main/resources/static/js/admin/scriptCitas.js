const apiUrl = "http://localhost:8080/api/citas";

const tablaCitas = document.querySelector("#citas tbody");
const pendientesCounter  = document.querySelector("#citas .stat-card:nth-child(1) h3");
const completadasCounter = document.querySelector("#citas .stat-card:nth-child(2) h3");
const canceladasCounter  = document.querySelector("#citas .stat-card:nth-child(3) h3");

function obtenerUsuarioSesion() {
    const data = localStorage.getItem("usuario");
    return data ? JSON.parse(data) : null;
}

async function cargarCitas() {
    try {
        const usuario = obtenerUsuarioSesion();
        if (!usuario) return;

        let url = apiUrl;

        if (usuario.rol === "VETERINARIO" && usuario.trabajador?.id) {
            url += `/veterinario/${usuario.trabajador.id}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener citas");

        const citas = await res.json();

        const estadoPrioridad = { pendiente: 1, completada: 2, cancelada: 3 };
        citas.sort((a, b) => {
            const estadoA = (a.estado || "").toLowerCase();
            const estadoB = (b.estado || "").toLowerCase();
            return (estadoPrioridad[estadoA] || 99) - (estadoPrioridad[estadoB] || 99);
        });

        await validarVencimientoCitas(citas);

        tablaCitas.innerHTML = "";

        let pendientes = 0;
        let completadas = 0;
        let canceladas = 0;

        citas.forEach(cita => {

            const estado = (cita.estado || "").toLowerCase();

            if (estado === "pendiente") pendientes++;
            if (estado === "completada") completadas++;
            if (estado === "cancelada") canceladas++;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="py-4 px-4">${cita.cliente?.nombre || '-'}</td>
                <td class="py-4 px-4">${cita.mascota?.nombre || '-'}</td>
                <td class="py-4 px-4">${cita.motivo || cita.servicio?.nombre || '-'}</td>
                <td class="py-4 px-4">
                    ${
                        cita.fecha
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
                    <button
                        class="text-yellow-500 hover:text-yellow-700 ${
                            estado === 'cancelada' ? 'opacity-40 cursor-not-allowed' : ''
                        }"
                        ${estado === 'cancelada' ? 'disabled' : ''}
                        onclick="cambiarEstado(${cita.id}, '${estado}')"
                    >
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
        if (!res.ok) throw new Error("No se pudo eliminar");

        showToast("success","Cita eliminada","Se eliminó correctamente");
        cargarCitas();

    } catch (error) {
        console.error(error);
        showToast("error","Error","No se pudo eliminar la cita");
    }
}

async function cambiarEstado(id, estadoActual) {
    if (estadoActual === "cancelada") {
        showToast("error","Acción no permitida","Las citas canceladas no cambian");
        return;
    }

    try {
        const resGet = await fetch(`${apiUrl}/${id}`);
        if (!resGet.ok) throw new Error("Error obteniendo cita");

        const cita = await resGet.json();

        if (estadoActual === "pendiente") {
            const ahora = new Date();
            const fechaCita = new Date(`${cita.fecha}T${cita.hora || "00:00"}`);

            if (fechaCita > ahora) {
                showToast("warning", "Cita futura", "No puedes completar una cita que aún no ha ocurrido");
                return;
            }
        }

        let nuevoEstado;
        if (estadoActual === "pendiente") nuevoEstado = "COMPLETADA";
        else if (estadoActual === "completada") nuevoEstado = "CANCELADA";
        else nuevoEstado = estadoActual.toUpperCase();

        const resPut = await fetch(`${apiUrl}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...cita, estado: nuevoEstado })
        });

        if (!resPut.ok) throw new Error("Error actualizando");

        showToast("success","Estado cambiado",`Nuevo estado: ${nuevoEstado}`);
        cargarCitas();

    } catch (error) {
        console.error(error);
        showToast("error","Error","No se pudo actualizar");
    }
}

async function validarVencimientoCitas(citas) {

    const ahora = new Date();
    const toleranciaMin = 20;

    for (const cita of citas) {

        if ((cita.estado || "").toLowerCase() !== "pendiente") continue;
        if (!cita.fecha || !cita.hora) continue;

        const fechaHora = new Date(`${cita.fecha}T${cita.hora}`);
        const limite = new Date(fechaHora.getTime() + toleranciaMin * 60000);

        if (ahora > limite) {
            try {
                await fetch(`${apiUrl}/${cita.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...cita, estado: "CANCELADA" })
                });
            } catch (err) {
                console.error(err);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", cargarCitas);
