// ======= HISTORIA CLÍNICA - SCRIPT CORREGIDO =======

document.addEventListener('DOMContentLoaded', () => {

    // Estado global
    let mascotaHistoriaActual = null;
    let todasMascotas = [];
    let enfermedadesData = {};
    let vacunasData = {}; // mapa de registros de mascota_vacuna (lista plana por id)
    let catalogoVacunasCache = {}; // cache de vacunas del catálogo por id

    // ---------- UTILIDADES ----------
    function obtenerFechaActual() {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${year}-${mes}-${dia}`;
    }

    function formatearFecha(fechaStr) {
        if (!fechaStr) return '-';
        // permite strings yyyy-MM-dd o ISO
        const f = new Date(fechaStr + (fechaStr.length === 10 ? 'T00:00:00' : ''));
        if (isNaN(f)) return '-';
        return f.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    function toInputDate(fechaStr) {
        if (!fechaStr) return '';
        // intenta normalizar a yyyy-MM-dd
        const d = new Date(fechaStr + (fechaStr.length === 10 ? 'T00:00:00' : ''));
        if (isNaN(d)) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function showToastFallback(type, title, msg) {
        if (typeof showToast === 'function') {
            showToast(type, title, msg);
        } else {
            // console fallback
            if (type === 'error') console.error(title, msg);
            else if (type === 'warning') console.warn(title, msg);
            else console.log(title, msg);
        }
    }

    // ---------- ACTUALIZAR TARJETAS ----------
    function actualizarEstadisticasHistoriaClinica(historia) {
        const estadoHistoria = historia && historia.mascotaId ? 'Activa' : 'Inactiva';
        const hcEstado = document.getElementById('hc-estado');
        if (hcEstado) hcEstado.textContent = estadoHistoria;

        if (historia.enfermedades && historia.enfermedades.length > 0) {
            const ultimaEnfermedad = historia.enfermedades[historia.enfermedades.length - 1];
            const nombreEnfermedad = ultimaEnfermedad.enfermedadNombre || 'Sin diagnósticos';
            const el = document.getElementById('hc-ultimo-diagnostico');
            if (el) {
                el.textContent = nombreEnfermedad;
                el.title = nombreEnfermedad;
            }
        } else {
            const el = document.getElementById('hc-ultimo-diagnostico');
            if (el) el.textContent = 'Sin diagnósticos';
        }

        // Dosis Aplicadas: contar vacunas con estado VIGENTE (o contar todas las aplicadas)
        let totalAplicadas = 0;
        if (historia.vacunas && historia.vacunas.length > 0) {
            totalAplicadas = historia.vacunas.filter(v => v.estado === 'VIGENTE').length;
        }
        const dosisEl = document.getElementById('hc-dosis-aplicadas');
        if (dosisEl) dosisEl.textContent = totalAplicadas;
    }

    // ---------- CARGAR MASCOTAS (selector / buscador) ----------
    async function cargarSelectorMascotas() {
        try {
            const response = await fetch('/api/clientes/clienteMascota');
            if (!response.ok) throw new Error('Error al obtener clientes');
            const clientes = await response.json();
            todasMascotas = [];
            clientes.forEach(cliente => {
                (cliente.mascotas || []).forEach(mascota => {
                    todasMascotas.push({
                        id: mascota.id,
                        nombre: `${mascota.nombre} (${cliente.nombre} ${cliente.apellido})`
                    });
                });
            });

            // cargar aleatoria al inicio
            if (todasMascotas.length > 0) {
                const mascotaAleatoria = todasMascotas[Math.floor(Math.random() * todasMascotas.length)];
                cargarHistoriaPorId(mascotaAleatoria.id);
            }
        } catch (error) {
            console.error('Error al cargar mascotas:', error);
            showToastFallback('error', 'Error', 'No se pudieron cargar las mascotas');
        }
    }

    // buscador dinámico
    const inputMascota = document.getElementById('buscadorMascotaHistoria');
    const listaSugerencias = document.getElementById('listaSugerenciasMascota');
    if (inputMascota && listaSugerencias) {
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
    }

    // ---------- CARGAR HISTORIA ----------
    async function cargarHistoriaPorId(mascotaId) {
        try {
            const response = await fetch(`/api/mascotas/${mascotaId}/historia`);
            if (!response.ok) throw new Error('Error al cargar historia');

            const historia = await response.json();
            mascotaHistoriaActual = historia;

            actualizarEstadisticasHistoriaClinica(historia);

            // actualizar info de la mascota en UI (verificar existencia de elementos)
            const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value ?? '-';
            };
            const setTitle = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.title = value ?? '';
            };

            setText('hc-mascota-nombre', historia.mascotaNombre || '-');
            setText('hc-mascota-especie', historia.especie || '-');
            setText('hc-mascota-raza', historia.raza || '-');
            setText('hc-mascota-edad', historia.edad ? `${historia.edad} años` : '-');

            const nombreCompleto = `${historia.duenoNombre || ''} ${historia.duenoApellido || ''}`.trim() || '-';
            setText('hc-dueno-nombre', nombreCompleto);
            setTitle('hc-dueno-nombre', nombreCompleto);

            const telefono = historia.duenoTelefono || '-';
            setText('hc-dueno-telefono', telefono);
            const link = document.getElementById('hc-dueno-telefono-link');
            if (link) link.href = telefono !== '-' ? `tel:${telefono}` : '#';

            // mini tarjetas
            if (historia.enfermedades && historia.enfermedades.length > 0) {
                const ultimaEnfermedad = historia.enfermedades[historia.enfermedades.length - 1];
                const nombreEnf = ultimaEnfermedad.enfermedadNombre || 'Sin diagnósticos';
                setText('hc-ultimo-diagnostico-mini', nombreEnf);
                setTitle('hc-ultimo-diagnostico-mini', nombreEnf);
            } else {
                setText('hc-ultimo-diagnostico-mini', 'Sin diagnósticos');
            }

            if (historia.vacunas && historia.vacunas.length > 0) {
                const proximaVacuna = historia.vacunas.find(v => v.estado === 'PENDIENTE');
                if (proximaVacuna) {
                    setText('hc-proxima-vacuna', proximaVacuna.vacunaNombre);
                    setText('hc-proxima-vacuna-mini', proximaVacuna.vacunaNombre);
                } else {
                    setText('hc-proxima-vacuna', 'Todas aplicadas');
                    setText('hc-proxima-vacuna-mini', 'Todas aplicadas');
                }
            } else {
                setText('hc-proxima-vacuna', 'Todas aplicadas');
                setText('hc-proxima-vacuna-mini', 'Todas aplicadas');
            }

            cargarTablaEnfermedades(historia.enfermedades || []);
            cargarTablaVacunas(historia.vacunas || []);
            const cont = document.getElementById('contenedor-historia');
            if (cont) cont.style.display = 'block';

        } catch (error) {
            console.error('Error al cargar historia:', error);
            showToastFallback('error', 'Error', 'No se pudo cargar la historia clínica');
        }
    }

    // ---------- TABLA ENFERMEDADES (sin cambios mayores) ----------
    function cargarTablaEnfermedades(enfermedades) {
        const tbody = document.querySelector('#tabla-hc-enfermedades tbody');
        if (!tbody) return;
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
                ? `<button class="text-blue-500 hover:text-blue-700 mr-2 transition" onclick="editarEnfermedadHistoria(${e.id})" title="Editar"><i class="fas fa-edit"></i></button>`
                : `<button class="text-gray-400 cursor-not-allowed mr-2" title="No se puede editar (Recuperado)" disabled><i class="fas fa-edit"></i></button>`;

            const puedeEliminar = e.estado !== 'RECUPERADO';
            const btnEliminar = puedeEliminar
                ? `<button class="text-red-500 hover:text-red-700 transition" onclick="eliminarEnfermedadHistoria(${e.id})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>`
                : `<button class="text-gray-400 cursor-not-allowed" title="No se puede eliminar (Recuperado)" disabled><i class="fas fa-trash-alt"></i></button>`;

            tbody.innerHTML += `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-4 px-4 font-semibold text-gray-800">${e.enfermedadNombre || '-'}</td>
                <td class="py-4 px-4 text-gray-600">${e.sintomas || '-'}</td>
                <td class="py-4 px-4 text-gray-600">${formatearFecha(e.fechaDiagnostico)}</td>
                <td class="py-4 px-4">${obtenerBadgeEstadoEnfermedad(e.estado)}</td>
                <td class="py-4 px-4 text-center">${btnEditar} ${btnEliminar}</td>
            </tr>`;
        });
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

    // ---------- MODAL / CARGA CATALOGO VACUNAS ----------
    async function cargarVacunasSelect() {
        try {
            const response = await fetch('/api/vacunas');
            if (!response.ok) throw new Error('Error al cargar vacunas');

            const vacunas = await response.json();
            const select = document.getElementById('hc-vacuna-select');
            if (!select) return;
            select.innerHTML = '<option value="">-- Seleccione --</option>';

            vacunas.forEach(v => {
                // guardamos en cache para uso posterior (dosisRequeridas)
                catalogoVacunasCache[v.id] = v;
                select.innerHTML += `<option value="${v.id}">${v.nombre} (${v.dosisRequeridas ?? '1'} dosis)</option>`;
            });

            // evento change para rellenar número de dosis automáticamente
            select.onchange = () => {
                const id = select.value;
                const dosisInput = document.getElementById('hc-vacuna-dosis');
                if (!dosisInput) return;
                if (!id) {
                    dosisInput.value = '1';
                    return;
                }
                const vacuna = catalogoVacunasCache[id];
                dosisInput.value = vacuna && vacuna.dosisRequeridas ? vacuna.dosisRequeridas : '1';
            };

        } catch (error) {
            console.error('Error al cargar vacunas:', error);
            showToastFallback('error', 'Error', 'No se pudo cargar el catálogo de vacunas');
        }
    }

    // ---------- TABLA VACUNAS (ajustada) ----------
    function cargarTablaVacunas(vacunas) {
        const tbody = document.querySelector('#tabla-hc-vacunas tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        vacunasData = {};

        if (!vacunas || vacunas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No hay vacunas registradas</td></tr>';
            return;
        }

        vacunas.forEach(v => {
            // v es DTO de mascota_vacuna
            vacunasData[v.id] = v;

            const puedeEditar = v.estado !== 'VENCIDA';
            const btnEditar = puedeEditar
                ? `<button class="text-blue-500 hover:text-blue-700 mr-2 transition" onclick="editarVacunaHistoria(${v.id})" title="Editar"><i class="fas fa-edit"></i></button>`
                : `<button class="text-gray-400 cursor-not-allowed mr-2" title="No se puede editar (Vencida)" disabled><i class="fas fa-edit"></i></button>`;

            const puedeEliminar = v.estado !== 'VENCIDA';
            const btnEliminar = puedeEliminar
                ? `<button class="text-red-500 hover:text-red-700 transition" onclick="eliminarVacunaHistoria(${v.id})" title="Eliminar"><i class="fas fa-trash-alt"></i></button>`
                : `<button class="text-gray-400 cursor-not-allowed" title="No se puede eliminar (Vencida)" disabled><i class="fas fa-trash-alt"></i></button>`;

            tbody.innerHTML += `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-4 px-4 font-semibold text-gray-800">${v.vacunaNombre || '-'}</td>
                <td class="py-4 px-4 text-gray-600">${formatearFecha(v.fechaAplicacion)}</td>
                <td class="py-4 px-4 text-gray-600">${v.proximaDosis ? formatearFecha(v.proximaDosis) : 'No programada'}</td>
                <td class="py-4 px-4 text-center font-semibold text-gray-800">${v.numeroDosis || 1}</td>
                <td class="py-4 px-4">${obtenerBadgeEstadoVacuna(v.estado)}</td>
                <td class="py-4 px-4 text-center">${btnEditar} ${btnEliminar}</td>
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

    // ---------- EDITAR VACUNA (abrir modal) ----------
    // Expuesto globalmente por el uso de onclick inline en la tabla
    window.editarVacunaHistoria = async function(id) {
       const vacuna = vacunasData[id];
           if (!vacuna) {
               showToastFallback('error', 'Error', 'No se encontraron los datos de la vacuna');
               return;
           }

           if (vacuna.estado === 'VENCIDA') {
               showToastFallback('warning', 'No permitido', 'No se puede editar una vacuna vencida');
               return;
           }

           if (vacuna.proximaDosis) {
               const hoy = obtenerFechaActual();
               const fechaProxima = toInputDate(vacuna.proximaDosis);

               if (fechaProxima > hoy) {
                   showToastFallback(
                       'warning',
                       'Aún no disponible',
                       `Esta dosis no puede aplicarse hasta el ${formatearFecha(vacuna.proximaDosis)}`
                   );
                   return;
               }
           }

       try {
            // llenamos modal con datos de la dosis (registro específico)
            document.getElementById('hc-vacuna-id').value = vacuna.id; // id del registro mascota_vacuna
            document.getElementById('titulo-modal-vacuna').textContent = 'Aplicar / Editar Dosis';
            document.getElementById('btn-guardar-vacuna').textContent = 'Actualizar Dosis';

            await cargarVacunasSelect(); // carga catálogo

            // seteos: bloquear select y numero de dosis (no se pueden cambiar)
            const select = document.getElementById('hc-vacuna-select');
            const dosisInput = document.getElementById('hc-vacuna-dosis');

            if (select) {
                select.value = vacuna.vacunaId;
                select.disabled = true;
            }
            if (dosisInput) {
                dosisInput.value = vacuna.numeroDosis || 1;
                dosisInput.disabled = true;
            }

            // fecha: si ya tiene fecha, mostrarla; si no, dejar la fecha actual para aplicar
            const fechaInput = document.getElementById('hc-vacuna-fecha');
            fechaInput.value = toInputDate(vacuna.fechaAplicacion) || obtenerFechaActual();

            const proximaInput = document.getElementById('hc-vacuna-proxima');
            proximaInput.value = toInputDate(vacuna.proximaDosis) || '';

            const estadoSelect = document.getElementById('hc-vacuna-estado');
            if (estadoSelect) {
                estadoSelect.value = vacuna.estado || 'PENDIENTE';
                // bloqueamos el estado también: lo controla backend según fecha/proxima
                estadoSelect.disabled = true;
            }

            document.getElementById('hc-vacuna-observaciones').value = vacuna.observaciones || '';

            document.getElementById('modalAgregarVacuna').classList.remove('hidden');

       } catch (error) {
            console.error('Error al cargar vacuna para editar:', error);
            showToastFallback('error', 'Error', 'No se pudieron cargar los datos de la vacuna');
       }
    };

    // ---------- ELIMINAR VACUNA ----------
    window.eliminarVacunaHistoria = async function(id) {
        const vacuna = vacunasData[id];
        if (!vacuna) {
            showToastFallback('error', 'Error', 'No se encontraron los datos de la vacuna');
            return;
        }
        if (vacuna.estado === 'VENCIDA') {
            showToastFallback('warning', 'No permitido', 'No se puede eliminar una vacuna vencida');
            return;
        }
        if (!confirm('¿Está seguro de eliminar esta vacuna?')) return;

        try {
            const response = await fetch(`/api/mascotas-vacunas/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToastFallback('success', 'Vacuna eliminada', 'El registro fue eliminado correctamente');
                await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
            } else {
                const text = await response.text();
                console.error('Error servidor al eliminar vacuna:', text);
                showToastFallback('error', 'Error', 'No se pudo eliminar la vacuna');
            }
        } catch (error) {
            console.error('Error al eliminar vacuna:', error);
            showToastFallback('error', 'Error de conexión', 'No se pudo conectar con el servidor');
        }
    };

    // ---------- ABRIR MODAL REGISTRAR VACUNA (nuevo) ----------
    window.abrirModalAgregarVacuna = async function() {
        if (!mascotaHistoriaActual) {
            showToastFallback('warning', 'Advertencia', 'Primero selecciona una mascota');
            return;
        }

        // limpiar y preparar modal en modo 'registro'
        document.getElementById('formAgregarVacuna').reset();
        document.getElementById('hc-vacuna-id').value = '';
        document.getElementById('titulo-modal-vacuna').textContent = 'Registrar Vacuna';
        document.getElementById('btn-guardar-vacuna').textContent = 'Guardar Vacuna';

        await cargarVacunasSelect();

        // habilitar campos para registro
        const select = document.getElementById('hc-vacuna-select');
        const dosisInput = document.getElementById('hc-vacuna-dosis');
        const estadoSelect = document.getElementById('hc-vacuna-estado');

        if (select) { select.disabled = false; select.value = ''; }
        if (dosisInput) { dosisInput.disabled = true; dosisInput.value = '1'; } // readonly: se rellena por selección
        if (estadoSelect) { estadoSelect.disabled = true; estadoSelect.value = 'VIGENTE'; }

        document.getElementById('hc-vacuna-fecha').value = obtenerFechaActual();
        document.getElementById('hc-vacuna-observaciones').value = '';

        document.getElementById('modalAgregarVacuna').classList.remove('hidden');
    };

    // ---------- CERRAR MODAL ----------
    window.cerrarModalAgregarVacuna = function() {
        const select = document.getElementById('hc-vacuna-select');
        const dosisInput = document.getElementById('hc-vacuna-dosis');
        const estadoSelect = document.getElementById('hc-vacuna-estado');
        if (select) { select.disabled = false; }
        if (dosisInput) { dosisInput.disabled = false; }
        if (estadoSelect) { estadoSelect.disabled = false; }
        document.getElementById('formAgregarVacuna').reset();
        document.getElementById('modalAgregarVacuna').classList.add('hidden');
    };

    // ---------- GUARDAR VACUNA (POST o PUT según modo) ----------
    const formVacuna = document.getElementById('formAgregarVacuna');
    if (formVacuna) {
        formVacuna.addEventListener('submit', async (e) => {
            e.preventDefault();

            const vacunaRegistroId = document.getElementById('hc-vacuna-id').value; // id del registro (edición) o '' (nuevo)
            const esEdicion = vacunaRegistroId !== '';

            const vacunaSelectValue = document.getElementById('hc-vacuna-select').value;
            const fechaAplicacion = document.getElementById('hc-vacuna-fecha').value;
            const observacionesValue = document.getElementById('hc-vacuna-observaciones').value.trim();

            // validaciones mínimas
            if (!vacunaSelectValue && !esEdicion) {
                showToastFallback('warning', 'Campos incompletos', 'Seleccione la vacuna');
                return;
            }
            if (!fechaAplicacion) {
                showToastFallback('warning', 'Campos incompletos', 'Ingrese la fecha de aplicación');
                return;
            }

            try {
                if (esEdicion) {
                    // PUT -> aplicar/actualizar la dosis específica
                    const dto = {
                        fechaAplicacion: fechaAplicacion,
                        observaciones: observacionesValue !== '' ? observacionesValue.toUpperCase() : null
                    };

                    const response = await fetch(`/api/mascotas-vacunas/${vacunaRegistroId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dto)
                    });

                    if (response.ok) {
                        const resultado = await response.json();
                        showToastFallback('success', 'Vacuna actualizada', 'Dosis actualizada correctamente');
                        cerrarModalAgregarVacuna();
                        await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
                    } else {
                        const errorText = await response.text();
                        console.error('Error servidor PUT vacuna:', errorText);
                        showToastFallback('error', 'Error al guardar', 'No se pudo actualizar la dosis: ' + errorText);
                    }

                } else {
                    // POST -> registrar primera dosis; backend genera todas las dosis automáticamente
                    const dto = {
                        mascotaId: mascotaHistoriaActual.mascotaId,
                        vacunaId: parseInt(vacunaSelectValue),
                        fechaAplicacion: fechaAplicacion,
                        observaciones: observacionesValue !== '' ? observacionesValue.toUpperCase() : null
                    };

                    const response = await fetch('/api/mascotas-vacunas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dto)
                    });

                    if (response.ok) {
                        // backend devuelve lista de dosis creadas
                        const resultado = await response.json();
                        showToastFallback('success', 'Vacuna registrada', 'Vacunas registradas correctamente');
                        cerrarModalAgregarVacuna();
                        await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
                    } else {
                        const errorText = await response.text();
                        console.error('Error servidor POST vacuna:', errorText);
                        showToastFallback('error', 'Error al guardar', 'No se pudo registrar la vacuna: ' + errorText);
                    }
                }
            } catch (error) {
                console.error('Error al guardar vacuna:', error);
                showToastFallback('error', 'Error de conexión', 'No se pudo conectar con el servidor');
            }
        });
    }

    // ---------- EDITAR ENFERMEDAD (se mantiene) ----------
    window.editarEnfermedadHistoria = async function(id) {
        const enfermedad = enfermedadesData[id];
        if (!enfermedad) {
            showToastFallback('error', 'Error', 'No se encontraron los datos de la enfermedad');
            return;
        }
        if (enfermedad.estado === 'RECUPERADO') {
            showToastFallback('warning', 'No permitido', 'No se puede editar un diagnóstico recuperado');
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
            showToastFallback('error', 'Error', 'No se pudieron cargar los datos de la enfermedad');
        }
    };

    // ---------- CARGAR CATALOGO ENFERMEDADES (se mantiene) ----------
    async function cargarEnfermedadesSelect() {
        try {
            const response = await fetch('/api/enfermedades');
            if (!response.ok) throw new Error('Error al cargar enfermedades');

            const enfermedades = await response.json();
            const select = document.getElementById('hc-enfermedad-select');
            if (!select) return;
            select.innerHTML = '<option value="">-- Seleccione --</option>';
            enfermedades.forEach(e => select.innerHTML += `<option value="${e.id}">${e.nombre}</option>`);
        } catch (error) {
            console.error('Error al cargar enfermedades:', error);
            showToastFallback('error', 'Error', 'No se pudo cargar el catálogo de enfermedades');
        }
    }

    // ---------- GUARDAR / ACTUALIZAR ENFERMEDAD (se mantiene) ----------
    const formEnf = document.getElementById('formAgregarEnfermedad');
    if (formEnf) {
        formEnf.addEventListener('submit', async (e) => {
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
                    showToastFallback('success',
                        esEdicion ? 'Diagnóstico actualizado' : 'Diagnóstico registrado',
                        'Datos guardados correctamente');
                    document.getElementById('formAgregarEnfermedad').reset();
                    document.getElementById('modalAgregarEnfermedad').classList.add('hidden');
                    await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
                } else {
                    const error = await response.text();
                    console.error('Error del servidor:', error);
                    showToastFallback('error', 'Error al guardar', 'No se pudo guardar el diagnóstico');
                }
            } catch (error) {
                console.error('Error al guardar enfermedad:', error);
                showToastFallback('error', 'Error de conexión', 'No se pudo conectar con el servidor');
            }
        });
    }

    // ---------- ELIMINAR ENFERMEDAD (se mantiene) ----------
    window.eliminarEnfermedadHistoria = async function(id) {
        const enfermedad = enfermedadesData[id];
        if (!enfermedad) {
            showToastFallback('error', 'Error', 'No se encontraron los datos de la enfermedad');
            return;
        }
        if (enfermedad.estado === 'RECUPERADO') {
            showToastFallback('warning', 'No permitido', 'No se puede eliminar un diagnóstico recuperado');
            return;
        }
        if (!confirm('¿Está seguro de eliminar este diagnóstico?')) return;
        try {
            const response = await fetch(`/api/mascotas-enfermedades/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToastFallback('success', 'Diagnóstico eliminado', 'El registro fue eliminado correctamente');
                await cargarHistoriaPorId(mascotaHistoriaActual.mascotaId);
            } else {
                showToastFallback('error', 'Error', 'No se pudo eliminar el diagnóstico');
            }
        } catch (error) {
            console.error('Error al eliminar enfermedad:', error);
            showToastFallback('error', 'Error de conexión', 'No se pudo conectar con el servidor');
        }
    };

    // ---------- INICIALIZACIÓN ----------
    // cargar selector de mascotas y catálogo vacunas inicial para UX
    cargarSelectorMascotas();
    cargarVacunasSelect();

    // Exponer abrirModalAgregarEnfermedad (onclick)
    window.abrirModalAgregarEnfermedad = function() {
        if (!mascotaHistoriaActual) {
            showToastFallback('warning', 'Advertencia', 'Primero selecciona una mascota');
            return;
        }
        document.getElementById('hc-enfermedad-id').value = '';
        document.getElementById('titulo-modal-enfermedad').textContent = 'Registrar Diagnóstico';
        document.getElementById('btn-guardar-enfermedad').textContent = 'Guardar Diagnóstico';
        document.getElementById('hc-enfermedad-fecha').value = obtenerFechaActual();
        document.getElementById('formAgregarEnfermedad').reset();
        cargarEnfermedadesSelect();
        document.getElementById('modalAgregarEnfermedad').classList.remove('hidden');
    };

    window.cerrarModalAgregarEnfermedad = function() {
        document.getElementById('formAgregarEnfermedad').reset();
        document.getElementById('modalAgregarEnfermedad').classList.add('hidden');
    };

});
