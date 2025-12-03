// ================================
// CARGAR SERVICIOS EN EL MODAL
// ================================
function cargarServiciosEnModal() {
    const selectServicio = document.getElementById("servicio");
    selectServicio.innerHTML = '<option value="">Seleccione un servicio</option>';

    serviciosDisponibles.forEach(servicio => {
        selectServicio.innerHTML += `
            <option value="${servicio.id}">
                ${servicio.nombre} - S/ ${servicio.precio}
            </option>
        `;
    });

    console.log("Servicios cargados en modal:", serviciosDisponibles);
}

// ================================
// ABRIR MODAL CON SERVICIO PRESELECCIONADO
// ================================
function abrirModalConServicio(servicioId) {
    console.log("servicioId recibido:", servicioId, "tipo:", typeof servicioId);

    servicioSeleccionadoId = servicioId;
    cargarServiciosEnModal();

    setTimeout(() => {
        const select = document.getElementById("servicio");
        select.value = servicioId;
        console.log("Valor asignado al select:", select.value);
    }, 100);

    document.getElementById("appointmentModal").classList.add("active");
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fecha").min = hoy;
}

// ================================
// CERRAR MODAL
// ================================
function closeAppointmentModal() {
    document.getElementById("appointmentModal").classList.remove("active");
    servicioSeleccionadoId = null;
}

// ================================
// BUSCAR CLIENTE POR DNI
// ================================
async function buscarPorDNI() {
    const dni = document.getElementById("dni").value;

    if (dni.length !== 8) {
        showToast("warning", "DNI inválido", "El DNI debe tener 8 dígitos.");
        return;
    }

    try {
        const reniecResp = await fetch(`http://localhost:3002/dni/${dni}`);
        const reniecData = await reniecResp.json();

        const clienteResp = await fetch(`http://localhost:8080/api/clientes/dni/${dni}`);
        let cliente = null;

        if (clienteResp.ok) {
            cliente = await clienteResp.json();
        }

        document.getElementById("nombre").value =
            (cliente?.nombre || reniecData.first_name || "");

        document.getElementById("apellido").value =
            (cliente?.apellido || `${reniecData.first_last_name || ""} ${reniecData.second_last_name || ""}`.trim());

        document.getElementById("telefono").value = cliente?.telefono || "";

        if (cliente && cliente.id) {
            await cargarMascotasDeCliente(cliente.id);
        } else {
            limpiarComboMascotas();
        }

    } catch (error) {
        console.error("Error DNI:", error);
        showToast("error", "Error de conexión", "No se pudo obtener los datos del DNI.");
    }
}

// ================================
// ENVIAR FORMULARIO DE CITA
// ================================
document.getElementById("formCita").addEventListener("submit", async (e) => {
    e.preventDefault();

    const servicioId = document.getElementById("servicio").value;
    console.log("servicioId al enviar:", servicioId, "tipo:", typeof servicioId);

    const fechaInput = document.getElementById("fecha").value;

    const datos = {
        cliente: {
            dni: document.getElementById("dni").value,
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            telefono: document.getElementById("telefono").value,
        },
        mascota: {
            nombre: document.getElementById("nombreMascota").value,
            especie: document.getElementById("especie").value,
            raza: document.getElementById("raza").value,
            edad: parseInt(document.getElementById("edad").value) || 0
        },
        cita: {
            fecha: fechaInput,
            hora: document.getElementById("hora").value,
            motivo: document.getElementById("motivo").value,
            estado: "PENDIENTE",
            servicioId: parseInt(servicioId) || null
        }
    };

    console.log("Datos a enviar:", datos);

    try {
        const response = await fetch("http://localhost:8080/api/citas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            showToast("success", "Cita registrada", "La cita fue agendada exitosamente.");
            closeAppointmentModal();
            limpiarComboMascotas();

        } else {
            const error = await response.json();
            console.error("Error del servidor:", error);
            showToast("error", "Error al registrar", "No se pudo registrar la cita.");
        }
    } catch (error) {
        console.error("Error:", error);
        showToast("error", "Error de servidor", "No se pudo conectar con el backend.");
    }
});

// ================================
// CARGAR MASCOTAS DE UN CLIENTE
// ================================
async function cargarMascotasDeCliente(clienteId) {
    try {
        const resp = await fetch(`http://localhost:8080/api/mascotas/cliente/${clienteId}`);
        const mascotas = await resp.json();

        const combo = document.getElementById("comboMascotas");
        const comboContainer = document.getElementById("comboMascotaContainer");
        const inputContainer = document.getElementById("inputNombreMascotaContainer");

        combo.innerHTML = `<option value="">Seleccione una mascota</option>`;

        if (mascotas.length === 0) {
            showToast("warning", "Sin mascotas", "Este cliente no tiene mascotas registradas.");
            comboContainer.classList.add("hidden");
            inputContainer.classList.remove("hidden");
            return;
        }

        if (mascotas.length === 1) {
            comboContainer.classList.add("hidden");
            inputContainer.classList.remove("hidden");
            cargarInfoMascota(mascotas[0]);
            return;
        }

        comboContainer.classList.remove("hidden");
        inputContainer.classList.remove("hidden");

        mascotas.forEach(m => {
            combo.innerHTML += `
                <option value="${m.id}">${m.nombre} (${m.especie})</option>
            `;
        });

        combo.onchange = () => {
            const id = parseInt(combo.value);
            const seleccionada = mascotas.find(m => m.id === id);
            if (seleccionada) cargarInfoMascota(seleccionada);
        };

    } catch (error) {
        console.error("Error cargando mascotas:", error);
        showToast("error", "Error", "No se pudieron cargar las mascotas.");
    }
}

// ================================
// CARGAR DATOS DE UNA MASCOTA SELECCIONADA
// ================================
function cargarInfoMascota(m) {
    document.getElementById("nombreMascota").value = m.nombre;
    document.getElementById("especie").value = m.especie;
    document.getElementById("raza").value = m.raza;
    document.getElementById("edad").value = m.edad;
}

function limpiarComboMascotas() {
    const combo = document.getElementById("comboMascotas");
    combo.innerHTML = `<option value="">Seleccione una mascota</option>`;

    document.getElementById("nombreMascota").value = "";
    document.getElementById("especie").value = "";
    document.getElementById("raza").value = "";
    document.getElementById("edad").value = "";
}
