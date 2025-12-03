// ==================== ACTUALIZAR ESTADÍSTICAS DE TARJETAS ====================
function actualizarEstadisticasHistoriaClinica(historia) {
    // 1. Estado de Historia Clínica
    const estadoHistoria = historia && historia.mascotaId ? 'Activa' : 'Inactiva';
    document.getElementById('hc-estado').textContent = estadoHistoria;

    // 2. Último Diagnóstico
    if (historia.enfermedades && historia.enfermedades.length > 0) {
        const ultimaEnfermedad = historia.enfermedades[historia.enfermedades.length - 1];
        const nombreEnfermedad = ultimaEnfermedad.enfermedadNombre || 'Sin diagnósticos';
        document.getElementById('hc-ultimo-diagnostico').textContent = nombreEnfermedad;
        document.getElementById('hc-ultimo-diagnostico').title = nombreEnfermedad;
    } else {
        document.getElementById('hc-ultimo-diagnostico').textContent = 'Sin diagnósticos';
    }

    // 3. Dosis Aplicadas (Total de diagnósticos registradas)
    const totalDiagnosticos = historia.enfermedades ? historia.enfermedades.length : 0;
    document.getElementById('hc-dosis-aplicadas').textContent = totalDiagnosticos;
}

let mascotaHistoriaActual = null;
let todasMascotas = [];
let enfermedadesData = {};
let vacunasData = {};

// ==================== OBTENER FECHA ACTUAL ====================
function obtenerFechaActual() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${mes}-${dia}`;
}

// ==================== CARGAR MASCOTAS ====================
async function cargarSelectorMascotas() {
    try {
        const response = await fetch('/api/clientes/clienteMascota');
        const clientes = await response.json();
        todasMascotas = [];
        clientes.forEach(cliente => {
            cliente.mascotas.forEach(mascota => {
                todasMascotas.push({
                    id: mascota.id,
                    nombre: `${mascota.nombre} (${cliente.nombre} ${cliente.apellido})`
                });
            });
        });

        // Cargar una mascota aleatoria al inicio
        if (todasMascotas.length > 0) {
            const mascotaAleatoria = todasMascotas[Math.floor(Math.random() * todasMascotas.length)];
            cargarHistoriaPorId(mascotaAleatoria.id);
        }
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se pudieron cargar las mascotas");
        }
    }
}

// ==================== BUSCADOR DINÁMICO ====================
const inputMascota = document.getElementById('buscadorMascotaHistoria');
const listaSugerencias = document.getElementById('listaSugerenciasMascota');

inputMascota.addEventListener('input', () => {
    const valor = inputMascota.value.toLowerCase();
    listaSugerencias.innerHTML = '';
    if (!valor) {
        listaSugerencias.style.display = 'none';
        return;
    }

    const coincidencias = todasMascotas.filter(m => m.nombre.toLowerCase().includes(valor));
    if (coincidencias.length === 0) {
        listaSugerencias.style.display = 'none';
        return;
    }

    coincidencias.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m.nombre;
        li.className = 'px-4 py-2 cursor-pointer hover:bg-gray-200';
        li.onclick = () => {
            inputMascota.value = m.nombre;
            listaSugerencias.style.display = 'none';
            cargarHistoriaPorId(m.id);
        };
        listaSugerencias.appendChild(li);
    });
    listaSugerencias.style.display = 'block';
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#buscadorMascotaHistoria')) {
        listaSugerencias.style.display = 'none';
    }
});

// ==================== CARGAR HISTORIA ====================
async function cargarHistoriaPorId(mascotaId) {
    try {
        const response = await fetch(`/api/mascotas/${mascotaId}/historia`);
        if (!response.ok) throw new Error('Error al cargar historia');

        const historia = await response.json();
        mascotaHistoriaActual = historia;

        actualizarEstadisticasHistoriaClinica(historia);

        // Actualizar información de la mascota
        document.getElementById('hc-mascota-nombre').textContent = historia.mascotaNombre || '-';
        document.getElementById('hc-mascota-especie').textContent = historia.especie || '-';
        document.getElementById('hc-mascota-raza').textContent = historia.raza || '-';
        document.getElementById('hc-mascota-edad').textContent = historia.edad ? `${historia.edad} años` : '-';

        const nombreCompleto = `${historia.duenoNombre || ''} ${historia.duenoApellido || ''}`.trim() || '-';
        document.getElementById('hc-dueno-nombre').textContent = nombreCompleto;
        document.getElementById('hc-dueno-nombre').title = nombreCompleto;

        const telefono = historia.duenoTelefono || '-';
        document.getElementById('hc-dueno-telefono').textContent = telefono;
        document.getElementById('hc-dueno-telefono-link').href = telefono !== '-' ? `tel:${telefono}` : '#';

        // Actualizar tarjetas pequeñas
        if (historia.enfermedades && historia.enfermedades.length > 0) {
            const ultimaEnfermedad = historia.enfermedades[historia.enfermedades.length - 1];
            const nombreEnf = ultimaEnfermedad.enfermedadNombre || 'Sin diagnósticos';
            document.getElementById('hc-ultimo-diagnostico-mini').textContent = nombreEnf;
            document.getElementById('hc-ultimo-diagnostico-mini').title = nombreEnf;
        } else {
            document.getElementById('hc-ultimo-diagnostico-mini').textContent = 'Sin diagnósticos';
        }

        // Actualizar próxima vacuna en tarjetas
        if (historia.vacunas && historia.vacunas.length > 0) {
            const proximaVacuna = historia.vacunas.find(v => v.estado === 'PENDIENTE');
            if (proximaVacuna) {
                document.getElementById('hc-proxima-vacuna').textContent = proximaVacuna.vacunaNombre;
                document.getElementById('hc-proxima-vacuna-mini').textContent = proximaVacuna.vacunaNombre;
            } else {
                document.getElementById('hc-proxima-vacuna').textContent = 'Todas aplicadas';
                document.getElementById('hc-proxima-vacuna-mini').textContent = 'Todas aplicadas';
            }
        }

        cargarTablaEnfermedades(historia.enfermedades);
        cargarTablaVacunas(historia.vacunas);
        document.getElementById('contenedor-historia').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar historia:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se pudo cargar la historia clínica");
        }
    }
}

// ==================== TABLA ENFERMEDADES ====================
function cargarTablaEnfermedades(enfermedades) {
    const tbody = document.querySelector('#tabla-hc-enfermedades tbody');
    tbody.innerHTML = '';
    enfermedadesData = {};

    if (!enfermedades || enfermedades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No hay enfermedades registradas</td></tr>';
        return;
    }

    enfermedades.forEach(e => {
        enfermedadesData[e.id] = e;

        const puedeEditar = e.estado !== 'RECUPERADO';
        const btnEditar = puedeEditar
            ? `<button class="text-blue-500 hover:text-blue-700 mr-2 transition" onclick="editarEnfermedadHistoria(${e.id})" title="Editar">
                 <i class="fas fa-edit"></i>
               </button>`
            : `<button class="text-gray-400 cursor-not-allowed mr-2" title="No se puede editar (Recuperado)" disabled>
                 <i class="fas fa-edit"></i>
               </button>`;

        const puedeEliminar = e.estado !== 'RECUPERADO';
        const btnEliminar = puedeEliminar
            ? `<button class="text-red-500 hover:text-red-700 transition" onclick="eliminarEnfermedadHistoria(${e.id})" title="Eliminar">
                 <i class="fas fa-trash-alt"></i>
               </button>`
            : `<button class="text-gray-400 cursor-not-allowed" title="No se puede eliminar (Recuperado)" disabled>
                 <i class="fas fa-trash-alt"></i>
               </button>`;

        tbody.innerHTML += `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="py-4 px-4 font-semibold text-gray-800">${e.enfermedadNombre || '-'}</td>
            <td class="py-4 px-4 text-gray-600">${e.sintomas || '-'}</td>
            <td class="py-4 px-4 text-gray-600">${formatearFecha(e.fechaDiagnostico)}</td>
            <td class="py-4 px-4">${obtenerBadgeEstadoEnfermedad(e.estado)}</td>
            <td class="py-4 px-4 text-center">
                ${btnEditar} ${btnEliminar}
            </td>
        </tr>`;
    });
}

// ==================== UTILIDADES ====================
function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const f = new Date(fechaStr + 'T00:00:00');
    return f.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function obtenerBadgeEstadoEnfermedad(estado) {
    switch (estado) {
        case 'EN_TRATAMIENTO':
            return '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">En Tratamiento</span>';
        case 'RECUPERADO':
            return '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Recuperado</span>';
        case 'CRONICO':
            return '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Crónico</span>';
        default:
            return '<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Desconocido</span>';
    }
}

// ==================== EDITAR ENFERMEDAD ====================
async function editarEnfermedadHistoria(id) {
    const enfermedad = enfermedadesData[id];

    if (!enfermedad) {
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se encontraron los datos de la enfermedad");
        }
        return;
    }

    if (enfermedad.estado === 'RECUPERADO') {
        if (typeof showToast === 'function') {
            showToast("warning", "No permitido", "No se puede editar un diagnóstico recuperado");
        } else {
            alert('No se puede editar un diagnóstico que ya está RECUPERADO');
        }
        return;
    }

    try {
        document.getElementById('hc-enfermedad-id').value = enfermedad.id;
        document.getElementById('titulo-modal-enfermedad').textContent = 'Editar Diagnóstico';
        document.getElementById('btn-guardar-enfermedad').textContent = 'Actualizar Diagnóstico';

        await cargarEnfermedadesSelect();

        document.getElementById('hc-enfermedad-select').value = enfermedad.enfermedadId;
        document.getElementById('hc-enfermedad-fecha').value = enfermedad.fechaDiagnostico;
        document.getElementById('hc-enfermedad-estado').value = enfermedad.estado;
        document.getElementById('hc-enfermedad-sintomas').value = enfermedad.sintomas || '';
        document.getElementById('hc-enfermedad-observaciones').value = enfermedad.observaciones || '';

        document.getElementById('modalAgregarEnfermedad').classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar enfermedad:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se pudieron cargar los datos de la enfermedad");
        }
    }
}

// ==================== MODAL ENFERMEDADES ====================
async function cargarEnfermedadesSelect() {
    try {
        const response = await fetch('/api/enfermedades');
        if (!response.ok) throw new Error('Error al cargar enfermedades');

        const enfermedades = await response.json();
        const select = document.getElementById('hc-enfermedad-select');
        select.innerHTML = '<option value="">-- Seleccione --</option>';

        enfermedades.forEach(e => {
            select.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
        });
    } catch (error) {
        console.error('Error al cargar enfermedades:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se pudo cargar el catálogo de enfermedades");
        }
    }
}

function abrirModalAgregarEnfermedad() {
    if (!mascotaHistoriaActual) {
        if (typeof showToast === 'function') {
            showToast("warning", "Advertencia", "Primero selecciona una mascota");
        } else {
            console.log('Primero selecciona una mascota');
        }
        return;
    }
    document.getElementById('hc-enfermedad-id').value = '';
    document.getElementById('titulo-modal-enfermedad').textContent = 'Registrar Diagnóstico';
    document.getElementById('btn-guardar-enfermedad').textContent = 'Guardar Diagnóstico';
    document.getElementById('hc-enfermedad-fecha').value = obtenerFechaActual();
    document.getElementById('formAgregarEnfermedad').reset();
    cargarEnfermedadesSelect();
    document.getElementById('modalAgregarEnfermedad').classList.remove('hidden');
}

function cerrarModalAgregarEnfermedad() {
    document.getElementById('formAgregarEnfermedad').reset();
    document.getElementById('modalAgregarEnfermedad').classList.add('hidden');
}

// ==================== GUARDAR ENFERMEDAD ====================
document.getElementById('formAgregarEnfermedad').addEventListener('submit', async (e) => {
    e.preventDefault();

    const enfermedadId = document.getElementById('hc-enfermedad-id').value;
    const esEdicion = enfermedadId !== '';

    const dto = {
        mascotaId: mascotaHistoriaActual.mascotaId,
        enfermedadId: parseInt(document.getElementById('hc-enfermedad-select').value),
        fechaDiagnostico: document.getElementById('hc-enfermedad-fecha').value,
        estado: document.getElementById('hc-enfermedad-estado').value,
        sintomas: document.getElementById('hc-enfermedad-sintomas').value.trim() || null,
        observaciones: document.getElementById('hc-enfermedad-observaciones').value.trim() || null
    };

    try {
        const url = esEdicion ? `/api/mascotas-enfermedades/${enfermedadId}` : '/api/mascotas-enfermedades';
        const method = esEdicion ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (response.ok) {
            if (typeof showToast === 'function') {
                showToast("success",
                    esEdicion ? "Diagnóstico actualizado" : "Diagnóstico registrado",
                    "Datos guardados correctamente");
            } else {
                console.log(esEdicion ? 'Diagnóstico actualizado exitosamente' : 'Diagnóstico registrado exitosamente');
            }
            cerrarModalAgregarEnfermedad();
            await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
        } else {
            const error = await response.text();
            console.error('Error del servidor:', error);
            if (typeof showToast === 'function') {
                showToast("error", "Error al guardar", "No se pudo guardar el diagnóstico");
            }
        }
    } catch (error) {
        console.error('Error al guardar enfermedad:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error de conexión", "No se pudo conectar con el servidor");
        }
    }
});

// ==================== ELIMINAR ENFERMEDAD ====================
async function eliminarEnfermedadHistoria(id) {
    const enfermedad = enfermedadesData[id];

    if (!enfermedad) {
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se encontraron los datos de la enfermedad");
        }
        return;
    }

    if (enfermedad.estado === 'RECUPERADO') {
        if (typeof showToast === 'function') {
            showToast("warning", "No permitido", "No se puede eliminar un diagnóstico recuperado");
        }
        return;
    }

    if (!confirm('¿Está seguro de eliminar este diagnóstico?')) return;

    try {
        const response = await fetch(`/api/mascotas-enfermedades/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            if (typeof showToast === 'function') {
                showToast("success", "Diagnóstico eliminado", "El registro fue eliminado correctamente");
            }
            await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
        } else {
            if (typeof showToast === 'function') {
                showToast("error", "Error", "No se pudo eliminar el diagnóstico");
            }
        }
    } catch (error) {
        console.error('Error al eliminar enfermedad:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error de conexión", "No se pudo conectar con el servidor");
        }
    }
}

// ==================== MODAL VACUNAS ====================
async function abrirModalAgregarVacuna() {
    if (!mascotaHistoriaActual) {
        if (typeof showToast === 'function') {
            showToast("warning", "Advertencia", "Primero selecciona una mascota");
        }
        return;
    }

    // Limpiar formulario completamente
    document.getElementById('formAgregarVacuna').reset();

    // Establecer valores por defecto
    document.getElementById('hc-vacuna-id').value = '';
    document.getElementById('titulo-modal-vacuna').textContent = 'Registrar Vacuna';
    document.getElementById('btn-guardar-vacuna').textContent = 'Guardar Vacuna';
    document.getElementById('hc-vacuna-fecha').value = obtenerFechaActual();
    document.getElementById('hc-vacuna-proxima').value = '';
    document.getElementById('hc-vacuna-estado').value = 'VIGENTE';
    document.getElementById('hc-vacuna-dosis').value = '1';
    document.getElementById('hc-vacuna-observaciones').value = '';
    document.getElementById('hc-vacuna-select').value = '';

    await cargarVacunasSelect();

    document.getElementById('modalAgregarVacuna').classList.remove('hidden');
}

function cerrarModalAgregarVacuna() {
    document.getElementById('formAgregarVacuna').reset();
    document.getElementById('modalAgregarVacuna').classList.add('hidden');
}

async function cargarVacunasSelect() {
    try {
        const response = await fetch('/api/vacunas');
        if (!response.ok) throw new Error('Error al cargar vacunas');

        const vacunas = await response.json();
        const select = document.getElementById('hc-vacuna-select');
        select.innerHTML = '<option value="">-- Seleccione --</option>';

        vacunas.forEach(v => {
            select.innerHTML += `<option value="${v.id}">${v.nombre}</option>`;
        });
    } catch (error) {
        console.error('Error al cargar vacunas:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se pudo cargar el catálogo de vacunas");
        }
    }
}

// ==================== TABLA VACUNAS ====================
function cargarTablaVacunas(vacunas) {
    const tbody = document.querySelector('#tabla-hc-vacunas tbody');
    tbody.innerHTML = '';
    vacunasData = {};

    if (!vacunas || vacunas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No hay vacunas registradas</td></tr>';
        return;
    }

    vacunas.forEach(v => {
        vacunasData[v.id] = v;

        const puedeEditar = v.estado !== 'VENCIDA';
        const btnEditar = puedeEditar
            ? `<button class="text-blue-500 hover:text-blue-700 mr-2 transition" onclick="editarVacunaHistoria(${v.id})" title="Editar">
                 <i class="fas fa-edit"></i>
               </button>`
            : `<button class="text-gray-400 cursor-not-allowed mr-2" title="No se puede editar (Vencida)" disabled>
                 <i class="fas fa-edit"></i>
               </button>`;

        const puedeEliminar = v.estado !== 'VENCIDA';
        const btnEliminar = puedeEliminar
            ? `<button class="text-red-500 hover:text-red-700 transition" onclick="eliminarVacunaHistoria(${v.id})" title="Eliminar">
                 <i class="fas fa-trash-alt"></i>
               </button>`
            : `<button class="text-gray-400 cursor-not-allowed" title="No se puede eliminar (Vencida)" disabled>
                 <i class="fas fa-trash-alt"></i>
               </button>`;

        tbody.innerHTML += `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="py-4 px-4 font-semibold text-gray-800">${v.vacunaNombre || '-'}</td>
            <td class="py-4 px-4 text-gray-600">${formatearFecha(v.fechaAplicacion)}</td>
            <td class="py-4 px-4 text-gray-600">${v.proximaDosis ? formatearFecha(v.proximaDosis) : 'No programada'}</td>
            <td class="py-4 px-4 text-center font-semibold text-gray-800">${v.numeroDosis || 1}</td>
            <td class="py-4 px-4">${obtenerBadgeEstadoVacuna(v.estado)}</td>
            <td class="py-4 px-4 text-center">
                ${btnEditar} ${btnEliminar}
            </td>
        </tr>`;
    });
}

function obtenerBadgeEstadoVacuna(estado) {
    switch (estado) {
        case 'VIGENTE':
            return '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Vigente</span>';
        case 'PENDIENTE':
            return '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pendiente</span>';
        case 'VENCIDA':
            return '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Vencida</span>';
        default:
            return '<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Desconocido</span>';
    }
}

// ==================== EDITAR VACUNA ====================
async function editarVacunaHistoria(id) {
    const vacuna = vacunasData[id];

    if (!vacuna) {
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se encontraron los datos de la vacuna");
        }
        return;
    }

    if (vacuna.estado === 'VENCIDA') {
        if (typeof showToast === 'function') {
            showToast("warning", "No permitido", "No se puede editar una vacuna vencida");
        }
        return;
    }

    try {
        document.getElementById('hc-vacuna-id').value = vacuna.id;
        document.getElementById('titulo-modal-vacuna').textContent = 'Editar Vacuna';
        document.getElementById('btn-guardar-vacuna').textContent = 'Actualizar Vacuna';

        await cargarVacunasSelect();

        document.getElementById('hc-vacuna-select').value = vacuna.vacunaId;
        document.getElementById('hc-vacuna-fecha').value = vacuna.fechaAplicacion;
        document.getElementById('hc-vacuna-proxima').value = vacuna.proximaDosis || '';
        document.getElementById('hc-vacuna-estado').value = vacuna.estado;
        document.getElementById('hc-vacuna-dosis').value = vacuna.numeroDosis || 1;
        document.getElementById('hc-vacuna-observaciones').value = vacuna.observaciones || '';

        document.getElementById('modalAgregarVacuna').classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar vacuna:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se pudieron cargar los datos de la vacuna");
        }
    }
}

// ==================== ELIMINAR VACUNA ====================
async function eliminarVacunaHistoria(id) {
    const vacuna = vacunasData[id];

    if (!vacuna) {
        if (typeof showToast === 'function') {
            showToast("error", "Error", "No se encontraron los datos de la vacuna");
        }
        return;
    }

    if (vacuna.estado === 'VENCIDA') {
        if (typeof showToast === 'function') {
            showToast("warning", "No permitido", "No se puede eliminar una vacuna vencida");
        }
        return;
    }

    if (!confirm('¿Está seguro de eliminar esta vacuna?')) return;

    try {
        const response = await fetch(`/api/mascotas-vacunas/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            if (typeof showToast === 'function') {
                showToast("success", "Vacuna eliminada", "El registro fue eliminado correctamente");
            }
            await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
        } else {
            if (typeof showToast === 'function') {
                showToast("error", "Error", "No se pudo eliminar la vacuna");
            }
        }
    } catch (error) {
        console.error('Error al eliminar vacuna:', error);
        if (typeof showToast === 'function') {
            showToast("error", "Error de conexión", "No se pudo conectar con el servidor");
        }
    }
}

// ==================== GUARDAR VACUNA ====================
document.getElementById('formAgregarVacuna').addEventListener('submit', async (e) => {
    e.preventDefault();

    const vacunaId = document.getElementById('hc-vacuna-id').value;
    const esEdicion = vacunaId !== '';

    // Obtener valores del formulario
    const vacunaSelectValue = document.getElementById('hc-vacuna-select').value;
    const fechaAplicacion = document.getElementById('hc-vacuna-fecha').value;
    const proximaDosisValue = document.getElementById('hc-vacuna-proxima').value.trim();
    const estadoValue = document.getElementById('hc-vacuna-estado').value;
    const dosisInput = document.getElementById('hc-vacuna-dosis').value;
    const observacionesValue = document.getElementById('hc-vacuna-observaciones').value;

    // Validar campos requeridos
    if (!vacunaSelectValue || !fechaAplicacion || !estadoValue || !dosisInput) {
        if (typeof showToast === 'function') {
            showToast('warning', 'Campos incompletos', 'Por favor complete todos los campos obligatorios');
        }
        return;
    }

    // Construir el DTO - proximaDosis es null solo si está completamente vacío
    const dto = {
        mascotaId: mascotaHistoriaActual.mascotaId,
        vacunaId: parseInt(vacunaSelectValue),
        fechaAplicacion: fechaAplicacion,
        proximaDosis: proximaDosisValue !== '' ? proximaDosisValue : null,
        estado: estadoValue,
        numeroDosis: parseInt(dosisInput) || 1,
        observaciones: observacionesValue.trim() !== '' ? observacionesValue.trim() : null
    };

    console.log('=== DEBUG VACUNA ===');
    console.log('Valor del input proximaDosis:', document.getElementById('hc-vacuna-proxima').value);
    console.log('DTO completo:', dto);
    console.log('JSON a enviar:', JSON.stringify(dto));
    console.log('===================');

    try {
        const url = esEdicion ? `/api/mascotas-vacunas/${vacunaId}` : '/api/mascotas-vacunas';
        const method = esEdicion ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });

        if (response.ok) {
            const resultado = await response.json();
            console.log('Respuesta del servidor:', resultado);

            if (typeof showToast === 'function') {
                showToast('success',
                    esEdicion ? 'Vacuna actualizada' : 'Vacuna registrada',
                    'Datos guardados correctamente');
            } else {
                console.log(esEdicion ? 'Vacuna actualizada exitosamente' : 'Vacuna registrada exitosamente');
            }
            cerrarModalAgregarVacuna();
            await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
        } else {
            const error = await response.text();
            console.error('Error del servidor:', error);
            if (typeof showToast === 'function') {
                showToast('error', 'Error al guardar', 'No se pudo guardar la vacuna: ' + error);
            }
        }
    } catch (error) {
        console.error('Error al guardar vacuna:', error);
        if (typeof showToast === 'function') {
            showToast('error', 'Error de conexión', 'No se pudo conectar con el servidor');
        }
    }
});

// ==================== INICIALIZACIÓN ====================
cargarSelectorMascotas();
