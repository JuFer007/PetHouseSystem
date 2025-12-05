// scriptHorarios.js - Versión Mejorada con Diseño Moderno

let horarioActual = null;
let todosTrabajadores = [];

const DIAS_SEMANA = {
    'MONDAY': { corto: 'Lun', largo: 'Lunes' },
    'TUESDAY': { corto: 'Mar', largo: 'Martes' },
    'WEDNESDAY': { corto: 'Mié', largo: 'Miércoles' },
    'THURSDAY': { corto: 'Jue', largo: 'Jueves' },
    'FRIDAY': { corto: 'Vie', largo: 'Viernes' },
    'SATURDAY': { corto: 'Sáb', largo: 'Sábado' },
    'SUNDAY': { corto: 'Dom', largo: 'Domingo' }
};

const formatHora = (hora) => {
    if (!hora) return "-";
    return hora.slice(0,5);
};

async function cargarTrabajadoresHorario() {
    const response = await fetch('/api/trabajadores');
    todosTrabajadores = await response.json();

    todosTrabajadores = todosTrabajadores
        .filter(t => t.activo && !t.cargo.toLowerCase().includes('admin'))
        .sort((a, b) => {
            const av = a.cargo.toLowerCase().includes('vet') ? 0 : 1;
            const bv = b.cargo.toLowerCase().includes('vet') ? 0 : 1;
            return av - bv;
        });

    const select = document.getElementById('veterinarioHorarioSelect');
    select.innerHTML = '<option value="">Seleccionar trabajador</option>';

    todosTrabajadores.forEach(t => {
        select.innerHTML += `
            <option value="${t.id}">
                ${t.nombre} ${t.apellido} - ${t.cargo}
            </option>`;
    });
}

function crearVistaCalendario(trabajador, horarios) {
    const container = document.createElement('div');
    container.className = 'bg-white rounded-2xl shadow-lg p-6';

    // Header con información del trabajador
    const header = document.createElement('div');
    header.className = 'bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 mb-6 text-white';
    header.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <i class="fas fa-user-md text-3xl"></i>
                </div>
                <div>
                    <h3 class="text-2xl font-bold">${trabajador.nombre} ${trabajador.apellido}</h3>
                    <p class="text-cyan-100 text-sm">${trabajador.cargo}</p>
                    <p class="text-cyan-100 text-xs mt-1">
                        <i class="fas fa-envelope mr-1"></i> ${trabajador.correoElectronico}
                    </p>
                </div>
            </div>
            <button onclick="abrirModalHorario(${trabajador.id})" 
                    class="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition shadow-lg">
                <i class="fas fa-plus mr-2"></i>Nuevo Turno
            </button>
        </div>
    `;
    container.appendChild(header);

    // Calendario semanal mejorado
    const calendario = document.createElement('div');
    calendario.className = 'grid grid-cols-7 gap-3';

    Object.keys(DIAS_SEMANA).forEach(dia => {
        const turnosDia = horarios.filter(h => h.diaSemana === dia && h.activo);
        const diaInfo = DIAS_SEMANA[dia];
        
        const diaCard = document.createElement('div');
        diaCard.className = `bg-gray-50 rounded-xl p-4 border-2 ${
            turnosDia.length > 0 ? 'border-cyan-300 bg-cyan-50' : 'border-gray-200'
        } hover:shadow-md transition`;

        let turnosHTML = '';
        if (turnosDia.length > 0) {
            turnosDia.forEach(h => {
                turnosHTML += `
                    <div class="bg-white rounded-lg p-3 mb-2 shadow-sm border border-cyan-200 hover:shadow-md transition">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2 text-cyan-600">
                                <i class="fas fa-clock text-sm"></i>
                                <span class="font-bold text-sm">${formatHora(h.horaInicio)}</span>
                            </div>
                            <div class="flex items-center gap-2 text-cyan-600">
                                <span class="font-bold text-sm">${formatHora(h.horaFin)}</span>
                                <i class="fas fa-arrow-right text-xs"></i>
                            </div>
                        </div>
                        <div class="flex justify-center gap-2 pt-2 border-t border-gray-200">
                            <button onclick="editarHorario(${h.id})" 
                                    class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50 transition"
                                    title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="eliminarHorario(${h.id})" 
                                    class="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition"
                                    title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        } else {
            turnosHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-moon text-gray-300 text-2xl mb-2"></i>
                    <p class="text-xs text-gray-400">Sin turnos</p>
                </div>
            `;
        }

        diaCard.innerHTML = `
            <div class="text-center mb-3">
                <div class="font-bold text-gray-700 text-sm">${diaInfo.corto}</div>
                <div class="text-xs text-gray-500">${diaInfo.largo}</div>
            </div>
            ${turnosHTML}
        `;

        calendario.appendChild(diaCard);
    });

    container.appendChild(calendario);
    return container;
}

async function cargarTodosLosHorarios() {
    const contenedor = document.getElementById('contenedorHorarios');
    contenedor.innerHTML = '';

    if (todosTrabajadores.length === 0) {
        contenedor.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-user-clock text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500 text-lg">No hay trabajadores registrados</p>
            </div>
        `;
        return;
    }

    try {
        for (const t of todosTrabajadores) {
            const horarios = await fetch(`/api/horarios/trabajador/${t.id}`).then(r => r.json());
            contenedor.appendChild(crearTarjetaCompacta(t, horarios));
        }
    } catch (err) {
        contenedor.innerHTML = `
            <div class="col-span-full text-center py-12 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p>Error cargando horarios</p>
            </div>
        `;
        console.error(err);
    }
}

function crearTarjetaCompacta(trabajador, horarios) {
    const card = document.createElement('div');
    card.className = 'bg-white shadow-lg rounded-xl p-5 hover:shadow-xl transition';

    const totalHoras = calcularHorasSemana(horarios);
    
    card.innerHTML = `
        <div class="flex items-center justify-between mb-4 pb-4 border-b">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white">
                    <i class="fas fa-user-md"></i>
                </div>
                <div>
                    <h4 class="font-bold text-gray-800">${trabajador.nombre} ${trabajador.apellido}</h4>
                    <p class="text-xs text-gray-500">${trabajador.cargo}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-xs text-gray-500">Horas/semana</p>
                <p class="text-xl font-bold text-cyan-600">${totalHoras}h</p>
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-3">
            ${Object.keys(DIAS_SEMANA).map(dia => {
                const turnosDia = horarios.filter(h => h.diaSemana === dia && h.activo);
                const diaInfo = DIAS_SEMANA[dia];
                return `
                    <div class="text-center">
                        <div class="text-xs font-semibold text-gray-600 mb-1">${diaInfo.corto}</div>
                        <div class="h-16 ${turnosDia.length > 0 ? 'bg-cyan-100 border-2 border-cyan-400' : 'bg-gray-100'} rounded-lg flex flex-col items-center justify-center">
                            ${turnosDia.length > 0 ? `
                                <span class="text-xs font-bold text-cyan-700">${formatHora(turnosDia[0].horaInicio)}</span>
                                <i class="fas fa-arrow-down text-xs text-cyan-500 my-0.5"></i>
                                <span class="text-xs font-bold text-cyan-700">${formatHora(turnosDia[0].horaFin)}</span>
                            ` : '<i class="fas fa-times text-gray-400 text-xs"></i>'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    return card;
}

function calcularHorasSemana(horarios) {
    return horarios.reduce((total, h) => {
        if (!h.activo) return total;
        const inicio = h.horaInicio.split(':').map(Number);
        const fin = h.horaFin.split(':').map(Number);
        const horas = (fin[0] * 60 + fin[1] - (inicio[0] * 60 + inicio[1])) / 60;
        return total + horas;
    }, 0).toFixed(1);
}

// Funciones del modal (sin cambios en la lógica)
function abrirModalHorario(id = null) {
    if (!id) {
        const select = document.getElementById('veterinarioHorarioSelect').value;
        if (!select) {
            showToast('warning', 'Seleccione un trabajador');
            return;
        }
        id = select;
    }

    horarioActual = null;
    document.getElementById("horarioId").value = "";
    document.getElementById("horarioVetId").value = id;
    document.getElementById("formHorario").reset();
    document.getElementById("tituloModalHorario").textContent = "Nuevo turno";
    document.getElementById("modalHorario").classList.remove("hidden");
}

function cerrarModalHorario() {
    document.getElementById("modalHorario").classList.add("hidden");
}

async function editarHorario(id) {
    const h = await fetch(`/api/horarios/${id}`).then(r => r.json());
    document.getElementById("horarioId").value = h.id;
    document.getElementById("horarioVetId").value = h.trabajadorId;
    document.getElementById("diaSemana").value = h.diaSemana;
    document.getElementById("horaInicio").value = formatHora(h.horaInicio);
    document.getElementById("horaFin").value = formatHora(h.horaFin);
    document.getElementById("tituloModalHorario").textContent = "Editar turno";
    document.getElementById("modalHorario").classList.remove("hidden");
}

async function eliminarHorario(id) {
    if (!confirm("¿Eliminar este turno?")) return;
    await fetch(`/api/horarios/${id}`, { method: "DELETE" });
    showToast("success","Horario eliminado");
}

function validarCruceHorarios(nuevo, existentes, editarId = null) {
    const toMin = h => {
        const [hh, mm] = h.split(":").map(Number);
        return hh * 60 + mm;
    };

    const nIni = toMin(nuevo.horaInicio);
    const nFin = toMin(nuevo.horaFin);

    return existentes.some(h => {
        if (!h.activo) return false;
        if (editarId && h.id == editarId) return false;
        const i = toMin(formatHora(h.horaInicio));
        const f = toMin(formatHora(h.horaFin));
        return (nIni < f && nFin > i);
    });
}

document.getElementById("formHorario").addEventListener("submit", async e => {
    e.preventDefault();

    const horarioId  = document.getElementById("horarioId").value;
    const trabajador = document.getElementById("horarioVetId").value;
    const diaSemana  = document.getElementById("diaSemana").value;

    const data = {
        trabajadorId: Number(trabajador),
        diaSemana,
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
        activo: true
    };

    const horariosExistentes = await fetch(`/api/horarios/trabajador/${trabajador}`)
        .then(r => r.json())
        .then(h => h.filter(x => x.diaSemana === diaSemana));

    if (validarCruceHorarios(data, horariosExistentes, horarioId || null)) {
        showToast("error","Cruce de horario","Este turno se cruza con otro existente");
        return;
    }

    const url = horarioId ? `/api/horarios/${horarioId}` : `/api/horarios`;
    const method = horarioId ? 'PUT' : 'POST';

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    cerrarModalHorario();
    showToast("success","Guardado");
});

async function cargarHorarioEmpleado(trabajadorId = null) {
    if (!trabajadorId) {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario || !usuario.trabajador || usuario.rol === "ADMIN") return;
        trabajadorId = usuario.trabajador.id;
    }

    const contenedor = document.getElementById("contenedorSemanaEmpleado");
    if (!contenedor) return;
    
    contenedor.innerHTML = '';

    try {
        const horarios = await fetch(`/api/horarios/trabajador/${trabajadorId}`).then(res => res.json());

        Object.keys(DIAS_SEMANA).forEach(dia => {
            const turnosDia = horarios.filter(h => h.diaSemana === dia && h.activo);
            const diaInfo = DIAS_SEMANA[dia];
            
            const diaCol = document.createElement('div');
            diaCol.className = `rounded-xl p-3 ${turnosDia.length > 0 ? 'bg-cyan-50 border-2 border-cyan-300' : 'bg-gray-100'}`;

            if (turnosDia.length > 0) {
                diaCol.innerHTML = turnosDia.map(h => `
                    <div class="bg-white rounded-lg p-2 shadow-sm mb-2">
                        <div class="text-center">
                            <div class="font-bold text-cyan-600 text-sm">${formatHora(h.horaInicio)}</div>
                            <i class="fas fa-arrow-down text-cyan-400 text-xs my-1"></i>
                            <div class="font-bold text-cyan-600 text-sm">${formatHora(h.horaFin)}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                diaCol.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-moon text-gray-400 text-xl"></i>
                        <p class="text-xs text-gray-500 mt-1">Libre</p>
                    </div>
                `;
            }

            contenedor.appendChild(diaCol);
        });

    } catch (error) {
        console.error("Error cargando horario del empleado:", error);
        contenedor.innerHTML = '<div class="col-span-7 text-center text-red-500">Error cargando horario</div>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarTrabajadoresHorario();
    cargarHorarioEmpleado();
});
