const API = "http://localhost:8080/api";

async function cargarStats() {
    try {
        document.getElementById("stats-citas").innerText = await getCitasHoy();
        document.getElementById("stat-clientes").innerText = await getClientesActivos();
        document.getElementById("stat-ventas").innerText = "S/. " + await getVentasMes();
        document.getElementById("stat-mascotas").innerText = await getTotalMascotas();
    } catch (error) {
        console.error("Error cargando stats:", error);
    }
}

async function getCitasHoy() {
    try {
        const inicio = new Date();
        inicio.setHours(0,0,0,0);

        const fin = new Date();
        fin.setHours(23,59,59,999);

        const res = await fetch(`${API}/citas/rango?inicio=${inicio.toISOString()}&fin=${fin.toISOString()}`);
        const data = await res.json();
        return data.length || 0;
    } catch (error) {
        console.error("Error en getCitasHoy:", error);
        return 0;
    }
}

async function getClientesActivos() {
    try {
        const res = await fetch(`${API}/clientes`);
        const data = await res.json();
        return data.length || 0;
    } catch (error) {
        console.error("Error en getClientesActivos:", error);
        return 0;
    }
}

async function getVentasMes() {
    try {
        const res = await fetch(`${API}/ventas/total`);
        if (!res.ok) {
            console.warn("Endpoint ventas retornó error:", res.status);
            return 0;
        }

        const total = await res.json();
        return (total || 0).toFixed(2);
    } catch (error) {
        console.error("Error en getVentasMes:", error);
        return 0;
    }
}

async function getTotalMascotas() {
    try {
        const res = await fetch(`${API}/mascotas`);
        const data = await res.json();
        return data.length || 0;
    } catch (error) {
        console.error("Error en getTotalMascotas:", error);
        return 0;
    }
}

async function cargarActividadReciente() {
    const cont = document.getElementById("actividad-reciente");
    cont.innerHTML = `<p class='text-gray-400'>Cargando...</p>`;

    try {
        const citas = await fetch(`${API}/citas`).then(r => r.json()).catch(e => {
            console.error("Error cargando citas:", e);
            return [];
        });

        const ventas = [];

        const actividades = [];

        citas.forEach(c => {
            if (c.fecha && c.cliente && c.mascota) {
                actividades.push({
                    tipo: "cita",
                    fecha: new Date(c.fecha), // Solo fecha, sin hora
                    cliente: c.cliente.nombre || "Cliente",
                    mascota: c.mascota.nombre || "Mascota",
                    motivo: c.motivo || "Cita"
                });
            }
        });

        ventas.forEach(v => {
            if (v.fecha) {
                actividades.push({
                    tipo: "venta",
                    fecha: new Date(v.fecha),
                    monto: v.montoTotal
                });
            }
        });

        actividades.sort((a,b) => b.fecha - a.fecha);

        cont.innerHTML = "";

        actividades.slice(0, 6).forEach(a => {
            let icon = "";
            let texto = "";
            let colorBg = "";
            let colorIcon = "";

            if (a.tipo === "cita") {
                icon = "fa-calendar-check";
                colorBg = "bg-cyan-100";
                colorIcon = "text-cyan-500";
                texto = `Nueva cita de ${a.cliente} — Mascota: ${a.mascota}`;
            } else {
                icon = "fa-shopping-cart";
                colorBg = "bg-green-100";
                colorIcon = "text-green-500";
                texto = `Venta realizada — S/. ${a.monto}`;
            }

            cont.innerHTML += `
                <div class="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition">
                    <div class="w-10 h-10 ${colorBg} rounded-full flex items-center justify-center">
                        <i class="fas ${icon} ${colorIcon}"></i>
                    </div>
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">${texto}</p>
                        <p class="text-sm text-gray-500">${a.fecha.toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        });

        if (actividades.length === 0) {
            cont.innerHTML = `<p class='text-gray-400'>No hay actividad reciente</p>`;
        }
    } catch (error) {
        console.error("Error en cargarActividadReciente:", error);
        cont.innerHTML = `<p class='text-red-400'>Error al cargar actividad</p>`;
    }
}

async function cargarCitasHoyLista() {
    const cont = document.getElementById("citas-hoy");
    cont.innerHTML = `<p class='text-gray-400'>Cargando citas...</p>`;

    try {
        const inicio = new Date();
        inicio.setHours(0,0,0,0);

        const fin = new Date();
        fin.setHours(23,59,59,999);

        const citas = await fetch(`${API}/citas/rango?inicio=${inicio.toISOString()}&fin=${fin.toISOString()}`)
            .then(r => r.json())
            .catch(e => {
                console.error("Error cargando citas de hoy:", e);
                return [];
            });

        cont.innerHTML = "";

        if (citas.length === 0) {
            cont.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full py-10 text-center text-gray-500">
                    <div style="margin-top: 170px;">
                        <i class="fas fa-calendar-times text-5xl mb-3"></i>
                        <p class="text-lg font-semibold">No hay citas hoy</p>
                    </div>
                </div>
            `;
            return;
        }

        citas.forEach(c => {
            let hora = "";
            if (c.fecha) {
                const fechaObj = new Date(c.fecha);
                hora = fechaObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }

            const clienteNombre = c.cliente?.nombre || "Cliente";
            const mascotaNombre = c.mascota?.nombre || "Mascota";
            const motivo = c.motivo || "Consulta";
            const estado = c.estado || "Programada";

            let borderColor = "border-cyan-500";
            let bgColor = "bg-cyan-50";

            if (estado === "COMPLETADA") {
                borderColor = "border-green-500";
                bgColor = "bg-green-50";
            } else if (estado === "CANCELADA") {
                borderColor = "border-red-500";
                bgColor = "bg-red-50";
            }

            cont.innerHTML += `
                <div class="flex items-center justify-between p-4 ${bgColor} rounded-lg border-l-4 ${borderColor}">
                    <div class="flex items-center space-x-3">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-cyan-600">${hora || "S/H"}</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-800">${clienteNombre}</p>
                            <p class="text-sm text-gray-600">${motivo} - ${mascotaNombre}</p>
                        </div>
                    </div>
                    <span class="badge bg-cyan-500 text-white text-xs px-2 py-1 rounded">${estado}</span>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error en cargarCitasHoyLista:", error);
        cont.innerHTML = `<p class='text-red-400'>Error al cargar citas</p>`;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    cargarStats();
    cargarActividadReciente();
    cargarCitasHoyLista();

    setInterval(() => {
        cargarStats();
        cargarActividadReciente();
        cargarCitasHoyLista();
    }, 30000);
});
