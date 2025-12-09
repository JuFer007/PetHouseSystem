let enfermedadActual = null;

async function cargarCatalogoEnfermedades() {
    try {
        const response = await fetch('/api/enfermedades');
        const enfermedades = await response.json();

        const tbody = document.querySelector('#tabla-catalogo-enfermedades tbody');
        tbody.innerHTML = '';

        enfermedades.forEach(enfermedad => {
            const row = document.createElement('tr');
            row.classList.add('table-row', 'border-b', 'border-gray-200');

            row.innerHTML = `
                <td class="py-4 px-4 font-semibold">${enfermedad.nombre || '-'}</td>
                <td class="py-4 px-4">${enfermedad.descripcion || '-'}</td>
                <td class="py-4 px-4">${enfermedad.tratamiento || '-'}</td>
                <td class="py-4 px-4 text-center">
                    <button class="text-blue-500 hover:text-blue-700 mr-2" onclick="editarEnfermedad(${enfermedad.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log(`${enfermedades.length} enfermedades cargadas en catálogo`);
    } catch (error) {
        console.error('Error cargando catálogo de enfermedades:', error);
    }
}

function abrirModalNuevaEnfermedad() {
    enfermedadActual = null;
    document.getElementById('tituloModalEnfermedad').textContent = 'Nueva Enfermedad';
    document.getElementById('formCatalogoEnfermedad').reset();
    document.getElementById('enfermedadId').value = '';

    const modal = document.getElementById('modalCatalogoEnfermedad');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.remove('hidden'), 10);
}


function cerrarModalEnfermedad() {
    const modal = document.getElementById('modalCatalogoEnfermedad');
    modal.classList.add('hidden');
    setTimeout(() => modal.style.display = 'none', 300);
}


async function editarEnfermedad(id) {
    try {
        const response = await fetch(`/api/enfermedades/${id}`);
        const enfermedad = await response.json();

        enfermedadActual = enfermedad;

        document.getElementById('tituloModalEnfermedad').textContent = 'Editar Enfermedad';

        document.getElementById('enfermedadId').value = enfermedad.id;
        document.getElementById('enfermedadNombre').value = enfermedad.nombre.toUpperCase() || '';
        document.getElementById('enfermedadDescripcion').value = enfermedad.descripcion.toUpperCase() || '';
        document.getElementById('enfermedadTratamiento').value = enfermedad.tratamiento.toUpperCase() || '';
        document.getElementById('enfermedadPrevencion').value = enfermedad.prevencion.toUpperCase() || '';

        abrirModalEditarEnfermedad();

    } catch (error) {
        console.error('Error cargando enfermedad:', error);
        showToast('error','Error','No se pudo cargar la enfermedad');
    }
}


function abrirModalEditarEnfermedad() {
    const modal = document.getElementById('modalCatalogoEnfermedad');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.remove('hidden'), 10);
}

document.getElementById('formCatalogoEnfermedad')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = document.getElementById('enfermedadId').value;
    const datos = {
        nombre: document.getElementById('enfermedadNombre').value.toUpperCase(),
        descripcion: document.getElementById('enfermedadDescripcion').value.toUpperCase(),
        tratamiento: document.getElementById('enfermedadTratamiento').value.toUpperCase(),
        prevencion: document.getElementById('enfermedadPrevencion').value.toUpperCase()
    };

    try {
        const url = id ? `/api/enfermedades/${id}` : '/api/enfermedades';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            showToast('success', 'Guardado', `Enfermedad ${id ? 'actualizada' : 'creada'} exitosamente`);
            cerrarModalEnfermedad();
            cargarCatalogoEnfermedades();
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        console.error('Error guardando enfermedad:', error);
        showToast('error', 'Error', 'No se pudo guardar la enfermedad');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoEnfermedades();
});
