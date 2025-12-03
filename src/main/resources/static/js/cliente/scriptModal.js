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
    }
}

// ================================
// ENVIAR FORMULARIO DE CITA
// ================================
document.getElementById("formCita").addEventListener("submit", async (e) => {
    e.preventDefault();

    const servicioId = document.getElementById("servicio").value;
    const fechaInput = document.getElementById("fecha").value;
    const horaInput = document.getElementById("hora").value;

    // ✅ VALIDACIÓN FECHA Y HORARIO
    if (!validarFechaHora(fechaInput, horaInput)) return;

    const datos = {
        cliente: {
            dni: document.getElementById("dni").value,
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            telefono: document.getElementById("telefono").value,
        },
        mascota: {
            nombre: document.getElementById("nombreMascota").value.toUpperCase(),
            especie: document.getElementById("especie").value.toUpperCase(),
            raza: document.getElementById("raza").value.toUpperCase(),
            edad: parseInt(document.getElementById("edad").value) || 0
        },
        cita: {
            fecha: fechaInput,
            hora: horaInput,
            motivo: document.getElementById("motivo").value,
            estado: "PENDIENTE",
            servicioId: parseInt(servicioId) || null
        }
    };

    try {
        const response = await fetch("http://localhost:8080/api/citas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            showToast("success", "Cita registrada", "La cita fue agendada exitosamente.");
            closeAppointmentModal();
            limpiarCamposModal();
        } else {
            const error = await response.json();
            console.error("Error del servidor:", error);
            showToast("error", "Error al registrar", "No se pudo registrar la cita.");
        }

    } catch (error) {
        console.error("Error:", error);
        showToast("error", "Error de conexión", "No se pudo conectar con el servidor.");
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
        console.log("error", "Error", "No se pudieron cargar las mascotas.");
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

function limpiarCamposModal() {
    document.getElementById("dni").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("telefono").value = "";

    document.getElementById("nombreMascota").value = "";
    document.getElementById("especie").value = "";
    document.getElementById("raza").value = "";
    document.getElementById("edad").value = "";

    document.getElementById("comboMascotas").innerHTML = `<option value="">Seleccione una mascota</option>`;
    document.getElementById("comboMascotaContainer").classList.add("hidden");
    document.getElementById("inputNombreMascotaContainer").classList.remove("hidden");

    document.getElementById("servicio").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
    document.getElementById("motivo").value = "";
}

//valdiar fecha y hora
function validarFechaHora(fecha, hora) {

    if (!fecha || !hora) {
        showToast("warning", "Datos incompletos", "Debe seleccionar fecha y hora.");
        return false;
    }

    const ahora = new Date();
    const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);

    if (fechaHoraSeleccionada < ahora) {
        showToast(
            "error",
            "Fecha inválida",
            "No puedes reservar una cita en una fecha u hora pasada."
        );
        return false;
    }

    const dia = fechaHoraSeleccionada.getDay();
    const horaDecimal = fechaHoraSeleccionada.getHours() + (fechaHoraSeleccionada.getMinutes() / 60);

    let horaInicio, horaFin;

    if (dia === 0) {
        horaInicio = 10;
        horaFin = 14;
    } else {
        horaInicio = 9;
        horaFin = 20;
    }

    if (horaDecimal < horaInicio || horaDecimal >= horaFin) {
        const horarioTexto =
            dia === 0
            ? "Domingos: 10:00 AM - 2:00 PM"
            : "Lunes a Sábado: 9:00 AM - 8:00 PM";
        showToast(
            "warning",
            "Horario no disponible",
            `La cita debe estar dentro del horario de atención:\n${horarioTexto}`
        );

        return false;
    }
   return true;
}
