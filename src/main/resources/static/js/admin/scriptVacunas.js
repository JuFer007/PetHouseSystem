let vacunaCatalogoActual = null;

async function cargarCatalogoVacunas() {
    try {
        const response = await fetch('/api/vacunas');
        const vacunas = await response.json();

        const tbody = document.querySelector('#tabla-catalogo-vacunas tbody');
        tbody.innerHTML = '';

        vacunas.forEach(vacuna => {
            const row = document.createElement('tr');
            row.classList.add('table-row', 'border-b', 'border-gray-200');

            row.innerHTML = `
                <td class="py-4 px-4 font-semibold">${vacuna.nombre || '-'}</td>
                <td class="py-4 px-4">${vacuna.descripcion || '-'}</td>
                <td class="py-4 px-4 text-center">${vacuna.dosisRequeridas || '-'}</td>
                <td class="py-4 px-4 text-center">
                    <button class="text-blue-500 hover:text-blue-700 mr-2" onclick="editarVacunaCatalogo(${vacuna.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-500 hover:text-red-700" onclick="eliminarVacunaCatalogo(${vacuna.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error cargando catálogo de vacunas:', error);
    }
}

//Abrir modal para nueva vacuna
function abrirModalVacunaNueva() {
    vacunaCatalogoActual = null;
    document.getElementById('tituloModalVacunaCatalogo').textContent = 'Nueva Vacuna';
    document.getElementById('formCatalogoVacuna').reset();
    document.getElementById('vacunaCatalogoId').value = '';
    abrirModalVacuna();
}

function abrirModalVacuna() {
    const modal = document.getElementById('modalCatalogoVacuna');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.remove('hidden'), 10);
}

//Cerrar modal
function cerrarModalVacunaCatalogo() {
    const modal = document.getElementById('modalCatalogoVacuna');
    modal.classList.add('hidden');
    setTimeout(() => modal.style.display = 'none', 300);
}

//Editar vacuna
async function editarVacunaCatalogo(id) {
    try {
        const response = await fetch(`/api/vacunas/${id}`);

        if (!response.ok) {
            throw new Error('No encontrada');
        }

        const vacuna = await response.json();
        vacunaCatalogoActual = vacuna;

        document.getElementById('tituloModalVacunaCatalogo').textContent = 'Editar Vacuna';
        document.getElementById('vacunaCatalogoId').value = vacuna.id;
        document.getElementById('vacunaCatalogoNombre').value = vacuna.nombre;
        document.getElementById('vacunaCatalogoDescripcion').value = vacuna.descripcion || '';
        document.getElementById('vacunaCatalogoDosis').value = vacuna.dosisRequeridas || 1;

        abrirModalVacuna();

    } catch (error) {
        console.error('Error cargando vacuna:', error);
        showToast('error', 'Error', 'No se pudo cargar la vacuna');
    }
}

//eliminar vacuna
async function eliminarVacunaCatalogo(id) {
    if (!confirm('¿Está seguro de eliminar esta vacuna del catálogo?')) return;

    try {
        const response = await fetch(`/api/vacunas/${id}`, { method: 'DELETE' });

        if (response.ok) {
            showToast('success', 'Eliminado', 'Vacuna eliminada del catálogo');
            cargarCatalogoVacunas();
        } else {
            throw new Error('Error al eliminar');
        }
    } catch (error) {
        console.error('Error eliminando vacuna:', error);
        showToast('error', 'Error', 'No se pudo eliminar la vacuna');
    }
}

//Guardar o actualizar vacuna
document.getElementById('formCatalogoVacuna')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('vacunaCatalogoNombre').value.trim();
    const dosis = parseInt(document.getElementById('vacunaCatalogoDosis').value);

    if (!nombre || !dosis || dosis < 1) {
        showToast('error', 'Validación', 'Complete los campos obligatorios');
        return;
    }

    const datos = {
        nombre: nombre,
        descripcion: document.getElementById('vacunaCatalogoDescripcion').value.trim(),
        dosisRequeridas: dosis
    };

    const id = document.getElementById('vacunaCatalogoId').value;

    try {
        const url = id ? `/api/vacunas/${id}` : '/api/vacunas';
        const method = id ? 'PUT' : 'POST';

        if (id) datos.id = parseInt(id);

        const response = await fetch(url, {
            method,
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(datos)
        });

        if (!response.ok) throw new Error();

        showToast('success','Guardado','Vacuna guardada correctamente');
        cerrarModalVacunaCatalogo();
        cargarCatalogoVacunas();

    } catch(e){
        console.error('Error guardando vacuna:', e);
        showToast('error','Error','No se pudo guardar la vacuna');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoVacunas();
});
