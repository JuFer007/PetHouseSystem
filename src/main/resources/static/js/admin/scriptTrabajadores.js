let editingId = null;

//ABRIR MODAL
function abrirModal(editar = false, trabajador = null) {
    document.getElementById("modalTrabajador").classList.remove("hidden");
    document.getElementById("divDNI").style.display = editar ? "none" : "block";
    document.getElementById("modalTitle").textContent = editar ? "Editar Trabajador" : "Agregar Trabajador";

    if (editar && trabajador) {
        editingId = trabajador.id;
        document.getElementById("nombreInput").value = trabajador.nombre || "";
        document.getElementById("apellidoInput").value = trabajador.apellido || "";
        document.getElementById("cargoInput").value = trabajador.cargo || "";
        document.getElementById("salarioInput").value = trabajador.salario || "";
        document.getElementById("telefonoInput").value = trabajador.telefono || "";
        document.getElementById("correoInput").value = trabajador.usuario?.correoElectronico || "";
        document.getElementById("activoInput").checked = trabajador.activo;
    } else {
        editingId = null;
        document.querySelectorAll("#modalTrabajador input, #modalTrabajador select").forEach(i => i.value = "");
        document.getElementById("activoInput").checked = true;
    }
}


//CERRAR MODAL
function cerrarModal() {
    document.getElementById("modalTrabajador").classList.add("hidden");
}

//BUSCAR POR DNI
async function buscarPorDNI() {
    const dni = document.getElementById("dniInput").value.trim();
    if (!dni) return showToast("error", "Error", "Ingrese un número de DNI.");

    try {
        const res = await fetch(`http://localhost:3002/dni/${dni}`);
        if (!res.ok) throw new Error("Error en la API de DNI");
        const data = await res.json();

        const nombre = data.first_name || "";
        const apellido = `${data.first_last_name || ""} ${data.second_last_name || ""}`.trim();

        document.getElementById("nombreInput").value = nombre;
        document.getElementById("apellidoInput").value = apellido;

        showToast("success", "Encontrado", "Datos cargados desde la API de DNI.");

    } catch (err) {
        console.error(err);
        showToast("error", "Error", "No se pudo obtener los datos del DNI.");
    }
}

// GUARDAR TRABAJADOR
async function guardarTrabajador() {
    const nombre = document.getElementById("nombreInput").value.trim();
    const apellido = document.getElementById("apellidoInput").value.trim();
    const cargo = document.getElementById("cargoInput").value;
    const salario = parseFloat(document.getElementById("salarioInput").value);
    const telefono = document.getElementById("telefonoInput").value.trim();
    const correo = document.getElementById("correoInput").value.trim();
    const activo = document.getElementById("activoInput").checked;

    if (!nombre || !apellido || !cargo || isNaN(salario) || salario < 0 || !correo || !correo.includes("@")) {
        return showToast("error", "Error", "Complete todos los campos correctamente.");
    }

    const trabajador = {
        nombre,
        apellido,
        cargo,
        salario,
        telefono,
        activo,
        usuario: {
            correoElectronico: correo,
            activo: true,
            password: "123456",
            rol: cargo
        }
    };

    try {
        let res;
        if (editingId) {
            res = await fetch(`http://localhost:8080/api/trabajadores/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trabajador)
            });
        } else {
            res = await fetch(`http://localhost:8080/api/trabajadores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trabajador)
            });
        }

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Error del backend:", errorText);
            throw new Error("Error al guardar trabajador");
        }
        showToast("success", "Éxito", `Trabajador ${editingId ? "actualizado" : "creado"} correctamente.`);
        cerrarModal();
        cargarTrabajadores();

    } catch (err) {
        console.error(err);
        showToast("error", "Error", "No se pudo guardar el trabajador.");
    }
}

// =======================================================
//                CARGAR LISTA DE TRABAJADORES
// =======================================================
async function cargarTrabajadores() {
    try {
        const res = await fetch("http://localhost:8080/api/trabajadores");
        const trabajadores = await res.json();

        const contenedor = document.getElementById("contenedorTrabajadores");
        contenedor.innerHTML = "";

        trabajadores.forEach(t => {
            contenedor.innerHTML += generarCardTrabajador(t);
        });

    } catch (err) {
        console.error("Error cargando trabajadores:", err);
        showToast("error", "Error", "No se pudo cargar la lista de trabajadores.");
    }
}

// =======================================================
//                  TEMPLATE DE CARD
// =======================================================
function generarCardTrabajador(t) {
    let imgCargo = `https://ui-avatars.com/api/?name=${t.nombre}+${t.apellido}&background=00CED1&color=fff`;
    if (t.cargo.toLowerCase().includes("veterinario")) imgCargo = "https://i.pinimg.com/1200x/7b/4d/e0/7b4de0c0abc72eb7e2553e9773a94f29.jpg";
    else if (t.cargo.toLowerCase().includes("recepcionista")) imgCargo = "https://i.pinimg.com/1200x/95/d2/f5/95d2f55f0c9c447bf575a44ec1c4eccb.jpg";
    else if (t.cargo.toLowerCase().includes("administrador")) imgCargo = "https://i.pinimg.com/736x/6c/97/34/6c9734b15b2cfa3104f7817d2841f8b8.jpg";

    const email = t.usuario?.correoElectronico || "No registrado";
    const telefono = t.telefono || "No registrado";

    return `
        <div class="chart-container module-card">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <img src="${imgCargo}" class="w-12 h-12 rounded-full">
                    <div>
                        <h4 class="font-semibold text-gray-800">${t.nombre} ${t.apellido}</h4>
                        <p class="text-sm text-gray-500">${t.cargo}</p>
                    </div>
                </div>

                <div class="relative">
                    <i class="fas fa-ellipsis-h text-gray-400 cursor-pointer" onclick="toggleMenu(${t.id})"></i>
                    <div id="menu-${t.id}" class="absolute hidden right-0 bg-white shadow rounded p-2 w-40 z-50">
                        <button onclick="editarTrabajador(${t.id})" class="w-full text-left px-2 py-1 hover:bg-gray-100">Editar</button>
                        <button onclick="${t.activo ? `desactivarTrabajador(${t.id})` : `activarTrabajador(${t.id})`}" class="w-full text-left px-2 py-1 hover:bg-gray-100">
                            ${t.activo ? "Desactivar" : "Activar"}
                        </button>
                        <button onclick="eliminarTrabajador(${t.id})" class="w-full text-left px-2 py-1 hover:bg-gray-100 text-red-500">Eliminar</button>
                    </div>
                </div>
            </div>

            <div class="space-y-2 mb-4">
                <p class="text-sm text-gray-600"><span class="font-semibold">Email:</span> ${email}</p>
                <p class="text-sm text-gray-600"><span class="font-semibold">Teléfono:</span> ${telefono}</p>
                <p class="text-sm text-gray-600">
                    <span class="font-semibold">Estado:</span>
                    <span class="status-badge ${t.activo ? "status-active" : "status-cancelled"}">
                        ${t.activo ? "Activo" : "Inactivo"}
                    </span>
                </p>
            </div>
        </div>
    `;
}


// =======================================================
//            MOSTRAR / OCULTAR MENÚ
// =======================================================
function toggleMenu(id) {
    document.querySelectorAll("[id^='menu-']").forEach(m => {
        if (m.id !== `menu-${id}`) m.classList.add("hidden");
    });
    const menu = document.getElementById(`menu-${id}`);
    menu.classList.toggle("hidden");
}

// =======================================================
//               ACTIVAR TRABAJADOR
// =======================================================
async function activarTrabajador(id) {
    try {
        const res = await fetch(`http://localhost:8080/api/trabajadores/${id}/activar`, { method: "PUT" });
        if (res.ok) {
            showToast("success", "Activado", "Trabajador activado correctamente.");
            cargarTrabajadores();
        }
    } catch (err) {
        console.error("Error activando trabajador:", err);
        showToast("error", "Error", "No se pudo activar el trabajador.");
    }
}

// =======================================================
//               DESACTIVAR TRABAJADOR
// =======================================================
async function desactivarTrabajador(id) {
    try {
        const res = await fetch(`http://localhost:8080/api/trabajadores/${id}/desactivar`, { method: "PUT" });
        if (res.ok) {
            showToast("success", "Desactivado", "Trabajador desactivado correctamente.");
            cargarTrabajadores();
        }
    } catch (err) {
        console.error("Error desactivando trabajador:", err);
        showToast("error", "Error", "No se pudo desactivar el trabajador.");
    }
}

// =======================================================
//                   ELIMINAR TRABAJADOR
// =======================================================
async function eliminarTrabajador(id) {
    if (!confirm("¿Seguro que deseas eliminar este trabajador?")) return;
    try {
        const res = await fetch(`http://localhost:8080/api/trabajadores/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("success", "Eliminado", "Trabajador eliminado correctamente.");
            cargarTrabajadores();
        }
    } catch (err) {
        console.error("Error eliminando trabajador:", err);
        showToast("error", "Error", "No se pudo eliminar el trabajador.");
    }
}

// =======================================================
//            Placeholder para editar
// =======================================================
async function editarTrabajador(id) {
    try {
        const res = await fetch(`http://localhost:8080/api/trabajadores/${id}`);
        if (!res.ok) throw new Error("Error al obtener el trabajador");
        const trabajador = await res.json();

        abrirModal(true, trabajador);
    } catch (err) {
        console.error(err);
        showToast("error", "Error", "No se pudo cargar el trabajador.");
    }
}

// =======================================================
//                     Iniciar carga
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    cargarTrabajadores();
});
