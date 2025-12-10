let veterinariosDisponibles = [];
let clienteActualSesion = null;

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
    }
}

async function abrirModalConServicio(servicioId) {
    servicioSeleccionadoId = servicioId;

    limpiarCamposModal();

    cargarServiciosEnModal();

    setTimeout(() => {
        const select = document.getElementById("servicio");
        select.value = servicioId;
    }, 100);

    const usuario = await window.SistemaAutenticacion.verificarSesion();

    if (usuario && usuario.cliente) {
        clienteActualSesion = usuario.cliente;
        await cargarDatosClienteLogueado(usuario.cliente);
        document.getElementById("btnBuscarDNI").style.display = "none";
    } else {
        clienteActualSesion = null;
        document.getElementById("btnBuscarDNI").style.display = "inline-block";
    }

    document.getElementById("appointmentModal").classList.add("active");
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById("fecha").min = hoy;
}

async function cargarDatosClienteLogueado(cliente) {
    try {
        document.getElementById("dni").value = cliente.dni || '';
        document.getElementById("nombre").value = cliente.nombre || '';
        document.getElementById("apellido").value = cliente.apellido || '';
        document.getElementById("telefono").value = cliente.telefono || '';

        document.getElementById("dni").readOnly = true;
        document.getElementById("nombre").readOnly = true;
        document.getElementById("apellido").readOnly = true;
        document.getElementById("telefono").readOnly = true;

        await cargarMascotasDeCliente(cliente.id);

    } catch (error) {
        console.error('Error cargando datos del cliente:', error);
    }
}

function closeAppointmentModal() {
    document.getElementById("appointmentModal").classList.remove("active");
    servicioSeleccionadoId = null;
    clienteActualSesion = null;

    document.getElementById("dni").readOnly = false;
    document.getElementById("nombre").readOnly = false;
    document.getElementById("apellido").readOnly = false;
    document.getElementById("telefono").readOnly = false;

    limpiarCamposModal();
}

async function buscarPorDNI() {
    const dni = document.getElementById("dni").value.trim();

    if (dni.length !== 8) {
        showToast("warning", "DNI inválido", "El DNI debe tener 8 dígitos");
        return;
    }

    try {
        const clienteResp = await fetch(`http://localhost:8080/api/clientes/dni/${dni}`);

        if (clienteResp.ok) {
            const cliente = await clienteResp.json();

            document.getElementById("nombre").value = (cliente.nombre || '').toUpperCase();
            document.getElementById("apellido").value = (cliente.apellido || '').toUpperCase();
            document.getElementById("telefono").value = cliente.telefono || "";

            await cargarMascotasDeCliente(cliente.id);

        } else {
            const reniecResp = await fetch(`http://localhost:3002/dni/${dni}`);

            if (!reniecResp.ok) {
                showToast("error", "DNI no encontrado", "Verifica el número ingresado");
                return;
            }

            const reniecData = await reniecResp.json();

            document.getElementById("nombre").value = (reniecData.first_name || "").toUpperCase();
            document.getElementById("apellido").value =
                `${reniecData.first_last_name || ""} ${reniecData.second_last_name || ""}`.trim().toUpperCase();
            document.getElementById("telefono").value = "";

            limpiarComboMascotas();
        }

    } catch (error) {
        console.error("Error buscando DNI:", error);
        showToast("error", "Error", "No se pudo consultar el DNI");
    }
}

async function verificarDisponibilidadVeterinario(veterinarioId, fecha, hora) {
    try {
        const response = await fetch(
            `http://localhost:8080/api/citas/veterinario/${veterinarioId}`
        );

        if (!response.ok) return true;

        const citasVeterinario = await response.json();

        const nuevaFechaHora = new Date(`${fecha}T${hora}`).getTime();

        const citaDuplicada = citasVeterinario.some(cita => {

            if (cita.estado !== 'PENDIENTE') return false;

            if (!cita.fecha || !cita.hora) return false;

            const fechaHoraExistente =
                new Date(`${cita.fecha}T${cita.hora}`).getTime();

            return nuevaFechaHora === fechaHoraExistente;
        });

        return !citaDuplicada;

    } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        return true;
    }
}

document.getElementById("formCita").addEventListener("submit", async (e) => {
    e.preventDefault();

    const dni = document.getElementById("dni").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const servicioId = document.getElementById("servicio").value;
    const fechaInput = document.getElementById("fecha").value;
    const horaInput = document.getElementById("hora").value;
    const veterinarioId = document.getElementById("veterinario").value;

    const nombreMascota = document.getElementById("nombreMascota").value.trim();
    const especie = document.getElementById("especie").value.trim();
    const raza = document.getElementById("raza").value.trim();
    const edad = document.getElementById("edad").value.trim();
    const motivo = document.getElementById("motivo").value.trim();

    if (!dni || dni.length !== 8) {
        showToast("error", "DNI inválido", "El DNI debe tener 8 dígitos");
        return;
    }

    if (!nombre || nombre.length < 2) {
        showToast("error", "Nombre requerido", "Ingrese el nombre del cliente");
        return;
    }

    if (!apellido || apellido.length < 2) {
        showToast("error", "Apellido requerido", "Ingrese el apellido del cliente");
        return;
    }

    if (!telefono || telefono.length !== 9) {
        showToast("error", "Teléfono inválido", "El teléfono debe tener 9 dígitos");
        return;
    }

    if (!nombreMascota || nombreMascota.length < 2) {
        showToast("error", "Nombre de mascota requerido", "Ingrese el nombre de la mascota");
        return;
    }

    if (!especie) {
        showToast("error", "Especie requerida", "Seleccione la especie de la mascota");
        return;
    }

    if (!raza) {
        showToast("error", "Raza requerida", "Ingrese la raza de la mascota");
        return;
    }

    if (!edad || parseInt(edad) < 0 || parseInt(edad) > 30) {
        showToast("error", "Edad inválida", "La edad debe estar entre 0 y 30 años");
        return;
    }

    if (!servicioId) {
        showToast("warning", "Servicio requerido", "Debe seleccionar un servicio");
        return;
    }

    if (!veterinarioId) {
        showToast("warning", "Veterinario requerido", "Debe seleccionar un veterinario para la cita");
        return;
    }

    if (!validarFechaHora(fechaInput, horaInput)) return;

    const disponible = await verificarDisponibilidadVeterinario(
        veterinarioId,
        fechaInput,
        horaInput
    );

    if (!disponible) {
        showToast(
            "error",
            "Veterinario no disponible",
            "El veterinario ya tiene una cita programada para esta fecha y hora. Por favor, seleccione otro horario."
        );
        return;
    }

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

            if (window.location.hash === '#perfil') {
                await cargarPerfilCompleto();
            }
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
            limpiarCamposMascota();
            return;
        }

        comboContainer.classList.remove("hidden");
        inputContainer.classList.remove("hidden");

        mascotas.forEach(m => {
            combo.innerHTML += `<option value="${m.id}">${m.nombre} (${m.especie})</option>`;
        });

        if (mascotas.length > 0) {
            const primeraMascota = mascotas[0];
            combo.value = primeraMascota.id;
            cargarInfoMascota(primeraMascota);
        }

        combo.onchange = () => {
            const id = parseInt(combo.value);

            if (!id) {
                limpiarCamposMascota();
                return;
            }

            const seleccionada = mascotas.find(m => m.id === id);
            if (seleccionada) {
                cargarInfoMascota(seleccionada);
            }
        };

    } catch (error) {
        console.error("Error cargando mascotas:", error);
    }
}

function cargarInfoMascota(mascota) {
    const nombreMascota = mascota.nombre || '';
    const especie = mascota.especie || '';
    const raza = mascota.raza || '';
    const edad = mascota.edad || 0;

    document.getElementById("nombreMascota").value = nombreMascota.toUpperCase();
    document.getElementById("especie").value = especie.toUpperCase();
    document.getElementById("raza").value = raza.toUpperCase();
    document.getElementById("edad").value = edad;

    console.log('Datos cargados:', {nombreMascota, especie, raza, edad});
}

function limpiarCamposMascota() {
    document.getElementById("nombreMascota").value = "";
    document.getElementById("especie").value = "";
    document.getElementById("raza").value = "";
    document.getElementById("edad").value = "";
}

function limpiarComboMascotas() {
    const combo = document.getElementById("comboMascotas");
    combo.innerHTML = `<option value="">Seleccione una mascota</option>`;
    document.getElementById("comboMascotaContainer").classList.add("hidden");
    limpiarCamposMascota();
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

    document.getElementById("dni").readOnly = false;
    document.getElementById("nombre").readOnly = false;
    document.getElementById("apellido").readOnly = false;
    document.getElementById("telefono").readOnly = false;
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
