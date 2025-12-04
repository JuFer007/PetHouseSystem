let horarioActual = null;

const DIAS_SEMANA = {
    'MONDAY': 'Lunes',
    'TUESDAY': 'Martes',
    'WEDNESDAY': 'Miércoles',
    'THURSDAY': 'Jueves',
    'FRIDAY': 'Viernes',
    'SATURDAY': 'Sábado',
    'SUNDAY': 'Domingo'
};

// Cargar veterinarios
async function cargarVeterinariosHorario() {
    try {
        const response = await fetch('/api/trabajadores/cargo/VETERINARIO');
        const veterinarios = await response.json();

        const select = document.getElementById('veterinarioHorarioSelect');
        select.innerHTML = '<option value="">Seleccione un veterinario</option>';

        veterinarios.forEach(vet => {
            if (vet.activo) {
                select.innerHTML += `<option value="${vet.id}">${vet.nombre} ${vet.apellido}</option>`;
            }
        });
    } catch (error) {
        console.error('Error cargando veterinarios:', error);
    }
}

// Cargar horarios de un veterinario
async function cargarHorariosVeterinario() {
    const veterinarioId = document.getElementById('veterinarioHorarioSelect').value;

    if (!veterinarioId) {
        document.getElementById('tablaHorarios').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/api/horarios/trabajador/${veterinarioId}`);
        const horarios = await response.json();

        const tbody = document.querySelector('#tablaHorarios tbody');
        tbody.innerHTML = '';

        if (horarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">No hay horarios registrados</td></tr>';
        } else {
            horarios.forEach(h => {
                const tr = document.createElement('tr');
                tr.classList.add('table-row', 'border-b', 'border-gray-200');

                tr.innerHTML = `
                    <td class="py-4 px-4">${DIAS_SEMANA[h.diaSemana]}</td>
                    <td class="py-4 px-4">${h.horaInicio}</td>
                    <td class="py-4 px-4">${h.horaFin}</td>
                    <td class="py-4 px-4 text-center">
                        <button class="text-blue-500 hover:text-blue-700 mr-2" onclick="editarHorario(${h.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-500 hover:text-red-700" onclick="eliminarHorario(${h.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        }

        document.getElementById('tablaHorarios').style.display = 'table';
    } catch (error) {
        console.error('Error cargando horarios:', error);
    }
}

// Abrir modal
function abrirModalHorario() {
    const veterinarioId = document.getElementById('veterinarioHorarioSelect').value;

    if (!veterinarioId) {
        showToast('warning', 'Seleccione veterinario', 'Primero debe seleccionar un veterinario');
        return;
    }

    horarioActual = null;
    document.getElementById('horarioId').value = '';
    document.getElementById('formHorario').reset();
    document.getElementById('tituloModalHorario').textContent = 'Nuevo Horario';
    document.getElementById('modalHorario').classList.remove('hidden');
}

function cerrarModalHorario() {
    document.getElementById('modalHorario').classList.add('hidden');
}

// Editar horario
async function editarHorario(id) {
    try {
        const veterinarioId = document.getElementById('veterinarioHorarioSelect').value;
        const response = await fetch(`/api/horarios/trabajador/${veterinarioId}`);
        const horarios = await response.json();

        horarioActual = horarios.find(h => h.id === id);

        if (!horarioActual) {
            showToast('error', 'Error', 'No se encontró el horario');
            return;
        }

        document.getElementById('horarioId').value = horarioActual.id;
        document.getElementById('diaSemana').value = horarioActual.diaSemana;
        document.getElementById('horaInicio').value = horarioActual.horaInicio;
        document.getElementById('horaFin').value = horarioActual.horaFin;

        document.getElementById('tituloModalHorario').textContent = 'Editar Horario';
        document.getElementById('modalHorario').classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudo cargar el horario');
    }
}

// Eliminar horario
async function eliminarHorario(id) {
    if (!confirm('¿Está seguro de eliminar este horario?')) return;

    try {
        const response = await fetch(`/api/horarios/${id}`, { method: 'DELETE' });

        if (response.ok) {
            showToast('success', 'Eliminado', 'Horario eliminado correctamente');
            cargarHorariosVeterinario();
        } else {
            showToast('error', 'Error', 'No se pudo eliminar el horario');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudo eliminar el horario');
    }
}

// Guardar horario
document.getElementById('formHorario')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const veterinarioId = document.getElementById('veterinarioHorarioSelect').value;
    const horarioId = document.getElementById('horarioId').value;

    const horario = {
        trabajadorId: parseInt(veterinarioId),
        diaSemana: document.getElementById('diaSemana').value,
        horaInicio: document.getElementById('horaInicio').value,
        horaFin: document.getElementById('horaFin').value,
        activo: true
    };

    try {
        const url = horarioId ? `/api/horarios/${horarioId}` : '/api/horarios';
        const method = horarioId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(horario)
        });

        if (response.ok) {
            showToast('success', 'Guardado', horarioId ? 'Horario actualizado' : 'Horario creado');
            cerrarModalHorario();
            cargarHorariosVeterinario();
        } else {
            showToast('error', 'Error', 'No se pudo guardar el horario');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudo guardar el horario');
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarVeterinariosHorario();
});