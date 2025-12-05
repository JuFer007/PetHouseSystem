// scriptHorarios.js - Versión Optimizada y Funcional

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

const formatHora = hora => hora ? hora.slice(0,5) : "-";

// ==================== Cargar Trabajadores ====================
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
    select.innerHTML = '<option value="">Todos los trabajadores</option>';

    todosTrabajadores.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${t.nombre} ${t.apellido} - ${t.cargo}</option>`;
    });
}

// ==================== Crear Tarjeta de Trabajador ====================
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
                <button onclick="abrirModalHorario(${trabajador.id})"
                        class="mt-2 bg-cyan-600 text-white text-xs px-3 py-1 rounded hover:bg-cyan-700 transition">
                    <i class="fas fa-plus mr-1"></i>Nuevo Turno
                </button>
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-3">
            ${Object.keys(DIAS_SEMANA).map(dia => {
                const turnosDia = horarios.filter(h => h.diaSemana === dia && h.activo);
                const diaInfo = DIAS_SEMANA[dia];

                return `
                    <div class="text-center">
                        <div class="text-xs font-semibold text-gray-600 mb-1">${diaInfo.corto}</div>
                        <div class="h-25 ${turnosDia.length > 0 ? 'bg-cyan-100 border-2 border-cyan-400' : 'bg-gray-100'} rounded-lg flex flex-col items-center justify-center p-1">
                            ${turnosDia.length > 0 ? turnosDia.map(h => `
                                <div class="flex flex-col items-center justify-center">
                                    <span class="text-xs font-bold text-cyan-700">${formatHora(h.horaInicio)}</span>
                                    <i class="fas fa-arrow-down text-xs text-cyan-500 my-0.5"></i>
                                    <span class="text-xs font-bold text-cyan-700">${formatHora(h.horaFin)}</span>
                                    <div class="flex gap-1 mt-1">
                                        <button onclick="editarHorario(${h.id})"
                                                class="text-blue-600 text-xs px-1 rounded hover:bg-blue-50"><i class="fas fa-edit"></i></button>
                                        <button onclick="eliminarHorario(${h.id})"
                                                class="text-red-600 text-xs px-1 rounded hover:bg-red-50"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                            `).join('') : '<i class="fas fa-times text-gray-400 text-xs"></i>'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    return card;
}

// ==================== Calcular Horas ====================
function calcularHorasSemana(horarios) {
    return horarios.reduce((total, h) => {
        if (!h.activo) return total;
        const [hi, mi] = h.horaInicio.split(':').map(Number);
        const [hf, mf] = h.horaFin.split(':').map(Number);
        return total + (hf*60 + mf - (hi*60 + mi))/60;
    },0).toFixed(1);
}

// ==================== Cargar Todos los Horarios ====================
// ==================== Cargar Todos los Horarios ====================
async function cargarTodosLosHorarios(trabajadorId = null) {
    const contenedor = document.getElementById('contenedorHorarios');
    contenedor.innerHTML = '';

    const trabajadores = trabajadorId ? todosTrabajadores.filter(t => t.id == trabajadorId) : todosTrabajadores;

    if(trabajadores.length === 0){
        contenedor.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No hay trabajadores</div>';
        return;
    }

    try {
        for(const t of trabajadores){
            const horarios = await fetch(`/api/horarios/trabajador/${t.id}`).then(r => r.json());
            contenedor.appendChild(crearTarjetaCompacta(t, horarios));
        }
    } catch(err) {
        contenedor.innerHTML = '<div class="col-span-full text-center py-12 text-red-500">Error cargando horarios</div>';
        console.error(err);
    }
}

// ==================== Modal ====================
function abrirModalHorario(id = null){
    if(!id){
        const select = document.getElementById('veterinarioHorarioSelect').value;
        if(!select){ showToast('warning','Seleccione un trabajador'); return; }
        id = select;
    }
    horarioActual = null;
    document.getElementById("horarioId").value = "";
    document.getElementById("horarioVetId").value = id;
    document.getElementById("formHorario").reset();
    document.getElementById("tituloModalHorario").textContent = "Nuevo turno";
    document.getElementById("modalHorario").classList.remove("hidden");
}

function cerrarModalHorario(){
    document.getElementById("modalHorario").classList.add("hidden");
}

// ==================== Editar y Eliminar ====================
async function editarHorario(id){
    const h = await fetch(`/api/horarios/${id}`).then(r => r.json());
    document.getElementById("horarioId").value = h.id;
    document.getElementById("horarioVetId").value = h.trabajadorId;
    document.getElementById("diaSemana").value = h.diaSemana;
    document.getElementById("horaInicio").value = formatHora(h.horaInicio);
    document.getElementById("horaFin").value = formatHora(h.horaFin);
    document.getElementById("tituloModalHorario").textContent = "Editar turno";
    document.getElementById("modalHorario").classList.remove("hidden");
}

async function eliminarHorario(id){
    if(!confirm("¿Eliminar este turno?")) return;
    await fetch(`/api/horarios/${id}`, { method: "DELETE" });
    showToast("success","Horario eliminado");
    await cargarTodosLosHorarios();
}

// ==================== Validar Cruce ====================
function validarCruceHorarios(nuevo, existentes, editarId = null){
    const toMin = h => { const [hh, mm] = h.split(':').map(Number); return hh*60 + mm; };
    const nIni = toMin(nuevo.horaInicio);
    const nFin = toMin(nuevo.horaFin);

    return existentes.some(h=>{
        if(!h.activo) return false;
        if(editarId && h.id == editarId) return false;
        const i = toMin(formatHora(h.horaInicio));
        const f = toMin(formatHora(h.horaFin));
        return nIni < f && nFin > i;
    });
}

// ==================== Formulario ====================
document.getElementById("formHorario").addEventListener("submit", async e=>{
    e.preventDefault();

    const horarioId = document.getElementById("horarioId").value;
    const trabajador = document.getElementById("horarioVetId").value;
    const diaSemana = document.getElementById("diaSemana").value;

    const data = {
        trabajadorId: Number(trabajador),
        diaSemana,
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
        activo: true
    };

    const horariosExistentes = await fetch(`/api/horarios/trabajador/${trabajador}`)
        .then(r=>r.json())
        .then(h=>h.filter(x=>x.diaSemana === diaSemana));

    if(validarCruceHorarios(data, horariosExistentes, horarioId || null)){
        showToast("error","Cruce de horario","Este turno se cruza con otro existente");
        return;
    }

    const url = horarioId ? `/api/horarios/${horarioId}` : `/api/horarios`;
    const method = horarioId ? 'PUT' : 'POST';

    await fetch(url,{
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    cerrarModalHorario();
    showToast("success","Guardado");
    await cargarTodosLosHorarios();
});

// ==================== Select de trabajador ====================
async function cargarHorariosVeterinario(){
    const select = document.getElementById('veterinarioHorarioSelect').value;
    if(select) await cargarTodosLosHorarios(select);
    else await cargarTodosLosHorarios();
}

// ==================== Inicialización ====================
document.addEventListener("DOMContentLoaded", async ()=>{
    await cargarTrabajadoresHorario();
    await cargarTodosLosHorarios();
});

function obtenerTrabajadorLogueado() {
    const usuarioJSON = localStorage.getItem('usuario'); // Ajusta la clave según tu almacenamiento
    if (!usuarioJSON) return null;
    return JSON.parse(usuarioJSON).trabajador; // Esto te da {id, nombre, apellido, cargo, ...}
}

async function cargarHorarioEmpleadoLogueado() {
    const trabajador = obtenerTrabajadorLogueado();
    if (!trabajador) return console.warn("No hay trabajador logueado");

    const contenedor = document.getElementById('contenedorSemanaEmpleado');
    const totalHorasEl = document.getElementById('horasSemanales');
    contenedor.innerHTML = '';
    totalHorasEl.textContent = '0h';

    try {
        const response = await fetch(`/api/horarios/trabajador/${trabajador.id}`);
        if (!response.ok) throw new Error('No se pudo obtener horario');
        const horarios = await response.json();

        const totalHoras = calcularHorasSemana(horarios);
        totalHorasEl.textContent = totalHoras + 'h';

        Object.keys(DIAS_SEMANA).forEach(dia => {
            const turnosDia = horarios.filter(h => h.diaSemana === dia && h.activo);
            const diaInfo = DIAS_SEMANA[dia];

            const diaDiv = document.createElement('div');
            diaDiv.className = 'text-center bg-gray-100 rounded-lg p-2 min-h-[5rem] flex flex-col items-center justify-center';
            diaDiv.innerHTML = `
                <div class="font-semibold text-gray-600">${diaInfo.corto}</div>
                <div class="text-xs text-gray-500 mb-1">${diaInfo.largo}</div>
                ${turnosDia.length > 0 ? turnosDia.map(h => `
                    <div class="text-cyan-700 font-bold text-sm">
                        ${formatHora(h.horaInicio)} - ${formatHora(h.horaFin)}
                    </div>
                `).join('') : '<div class="text-gray-400 text-xs">Libre</div>'}
            `;
            contenedor.appendChild(diaDiv);
        });

    } catch(err) {
        contenedor.innerHTML = '<div class="col-span-full text-center py-12 text-red-500">Error cargando horario</div>';
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarHorarioEmpleadoLogueado();
});
