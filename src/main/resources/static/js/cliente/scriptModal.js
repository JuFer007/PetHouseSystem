let veterinariosDisponibles = [];

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
}

async function cargarVeterinariosDisponibles() {
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    if (!fecha || !hora) {
        document.getElementById("veterinario-container").style.display = "none";
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:8080/api/veterinarios-disponibles?fecha=${fecha}&hora=${hora}`
        );

        veterinariosDisponibles = await response.json();

        const select = document.getElementById("veterinario");
        select.innerHTML = '<option value="">Seleccione un veterinario</option>';

        if (veterinariosDisponibles.length === 0) {
            showToast("warning", "Sin disponibilidad",
                "No hay veterinarios disponibles para esta fecha y hora.");
            document.getElementById("veterinario-container").style.display = "none";
            return;
        }

        veterinariosDisponibles.forEach(vet => {
            select.innerHTML += `
                <option value="${vet.id}">
                    ${vet.nombre} ${vet.apellido}
                    (${vet.horaInicio} - ${vet.horaFin})
                </option>
            `;
        });

        document.getElementById("veterinario-container").style.display = "block";

    } catch (error) {
        console.error("Error cargando veterinarios:", error);
        showToast("error", "Error", "No se pudieron cargar los veterinarios disponibles.");
    }
}

function abrirModalConServicio(servicioId) {
    servicioSeleccionadoId = servicioId;
    cargarServiciosEnModal();

    setTimeout(() => {
        const select = document.getElementById("servicio");
        select.value = servicioId;
    }, 100);

    document.getElementById("appointmentModal").classList.add("active");
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fecha").min = hoy;
}

function closeAppointmentModal() {
    document.getElementById("appointmentModal").classList.remove("active");
    servicioSeleccionadoId = null;
}

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
            (cliente?.nombre || reniecData.first_name || "").toUpperCase();

        document.getElementById("apellido").value =
            (cliente?.apellido || `${reniecData.first_last_name || ""} ${reniecData.second_last_name || ""}`.trim()).toUpperCase();

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

document.getElementById("formCita").addEventListener("submit", async (e) => {
    e.preventDefault();

    const servicioId = document.getElementById("servicio").value;
    const fechaInput = document.getElementById("fecha").value;
    const horaInput = document.getElementById("hora").value;
    const veterinarioId = document.getElementById("veterinario").value;

    if (!veterinarioId) {
        showToast("warning", "Veterinario requerido",
            "Debe seleccionar un veterinario para la cita.");
        return;
    }

    if (!validarFechaHora(fechaInput, horaInput)) return;

    const datos = {
        cliente: {
            dni: document.getElementById("dni").value,
            nombre: document.getElementById("nombre").value.toUpperCase(),
            apellido: document.getElementById("apellido").value.toUpperCase(),
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
            motivo: document.getElementById("motivo").value.toUpperCase(),
            estado: "PENDIENTE",
            servicioId: parseInt(servicioId) || null,
            veterinarioId: parseInt(veterinarioId)
        }
    };

    try {
        const response = await fetch("http://localhost:8080/api/citas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            showToast("success", "Cita registrada",
                "La cita fue agendada exitosamente.");
            closeAppointmentModal();
            limpiarCamposModal();
        } else {
            const error = await response.json();
            console.error("Error del servidor:", error);
            showToast("error", "Error al registrar",
                "No se pudo registrar la cita.");
        }

    } catch (error) {
        console.error("Error:", error);
        showToast("error", "Error de conexión",
            "No se pudo conectar con el servidor.");
    }
});

async function cargarMascotasDeCliente(clienteId) {
    try {
        const resp = await fetch(`http://localhost:8080/api/mascotas/cliente/${clienteId}`);
        const mascotas = await resp.json();

        const combo = document.getElementById("comboMascotas");
        const comboContainer = document.getElementById("comboMascotaContainer");
        const inputContainer = document.getElementById("inputNombreMascotaContainer");

        combo.innerHTML = `<option value="">Seleccione una mascota</option>`;

        if (mascotas.length === 0) {
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
    }
}

function cargarInfoMascota(m) {
    document.getElementById("nombreMascota").value = m.nombre.toUpperCase();
    document.getElementById("especie").value = m.especie.toUpperCase();
    document.getElementById("raza").value = m.raza.toUpperCase();
    document.getElementById("edad").value = m.edad;
}

function limpiarComboMascotas() {
    document.getElementById("comboMascotas").innerHTML =
        `<option value="">Seleccione una mascota</option>`;
    document.getElementById("comboMascotaContainer").classList.add("hidden");
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
    document.getElementById("servicio").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
    document.getElementById("motivo").value = "";
    document.getElementById("veterinario").value = "";
    document.getElementById("veterinario-container").style.display = "none";
    limpiarComboMascotas();
}

function validarFechaHora(fecha, hora) {
    if (!fecha || !hora) {
        showToast("warning", "Datos incompletos",
            "Debe seleccionar fecha y hora.");
        return false;
    }

    const ahora = new Date();
    const fechaHoraSeleccionada = new Date(`${fecha}T${hora}`);

    if (fechaHoraSeleccionada < ahora) {
        showToast("error", "Fecha inválida",
            "No puedes reservar una cita en una fecha u hora pasada.");
        return false;
    }

    const dia = fechaHoraSeleccionada.getDay();
    const horaDecimal = fechaHoraSeleccionada.getHours() +
                        (fechaHoraSeleccionada.getMinutes() / 60);

    let horaInicio, horaFin;

    if (dia === 0) {
        horaInicio = 10;
        horaFin = 14;
    } else {
        horaInicio = 9;
        horaFin = 20;
    }

    if (horaDecimal < horaInicio || horaDecimal >= horaFin) {
        const horarioTexto = dia === 0
            ? "Domingos: 10:00 AM - 2:00 PM"
            : "Lunes a Sábado: 9:00 AM - 8:00 PM";
        showToast("warning", "Horario no disponible",
            `La cita debe estar dentro del horario de atención:\n${horarioTexto}`);
        return false;
    }
    return true;
}

document.getElementById("fecha").addEventListener("change", cargarVeterinariosDisponibles);
document.getElementById("hora").addEventListener("change", cargarVeterinariosDisponibles);
