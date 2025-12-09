let usuariosActuales = [];

async function cargarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        usuariosActuales = await response.json();

        const usuariosFiltrables = usuariosActuales.filter(u => u.rol !== 'CLIENTE');

        const tbody = document.querySelector('#tabla-usuarios tbody');
        tbody.innerHTML = '';

        if (usuariosFiltrables.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-gray-500">
                        No hay usuarios registrados
                    </td>
                </tr>
            `;
            actualizarEstadisticasUsuarios();
            return;
        }

        usuariosFiltrables.forEach(usuario => {
            const estadoBadge = usuario.activo
                ? '<span class="status-badge status-active">Activo</span>'
                : '<span class="status-badge status-inactive">Inactivo</span>';

            const trabajadorInfo = usuario.trabajador
                ? `${usuario.trabajador.nombre} ${usuario.trabajador.apellido}`
                : 'Sin asignar';

            const tr = document.createElement('tr');
            tr.className = 'border-b border-gray-200 hover:bg-gray-50 transition';
            tr.innerHTML = `
                <td class="py-3 px-4">${usuario.correoElectronico}</td>
                <td class="py-3 px-4">${usuario.rol}</td>
                <td class="py-3 px-4">${trabajadorInfo}</td>
                <td class="py-3 px-4 text-center">${estadoBadge}</td>
                <td class="py-3 px-4 text-center">
                    <button onclick="toggleEstadoUsuario(${usuario.id}, ${usuario.activo})"
                            class="text-${usuario.activo ? 'orange' : 'green'}-500 hover:text-${usuario.activo ? 'orange' : 'green'}-700 mr-3"
                            title="${usuario.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas fa-${usuario.activo ? 'ban' : 'check-circle'} text-lg"></i>
                    </button>
                    <button onclick="eliminarUsuario(${usuario.id})"
                            class="text-red-500 hover:text-red-700"
                            title="Eliminar">
                        <i class="fas fa-trash text-lg"></i>
                    </button>
                </td>
            `;
            actualizarEstadisticasUsuarios();
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        const tbody = document.querySelector('#tabla-usuarios tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-red-500">
                    Error al cargar usuarios
                </td>
            </tr>
        `;
        actualizarEstadisticasUsuarios();
    }
}

function actualizarEstadisticasUsuarios() {
    const usuariosFiltrables = usuariosActuales.filter(u => u.rol !== 'CLIENTE');

    const total = usuariosFiltrables.length;
    const activos = usuariosFiltrables.filter(u => u.activo).length;
    const inactivos = total - activos;

    const porRol = usuariosFiltrables.reduce((acc, u) => {
        acc[u.rol] = (acc[u.rol] || 0) + 1;
        return acc;
    }, {});

    document.getElementById('stat-usuarios-total').textContent = total;
    document.getElementById('stat-usuarios-activos').textContent = activos;
    document.getElementById('stat-usuarios-inactivos').textContent = inactivos;

    const adminCount = porRol['ADMIN'] || 0;
    const vetCount = porRol['VETERINARIO'] || 0;
    const recepCount = porRol['RECEPCIONISTA'] || 0;

    document.getElementById('stat-usuarios-admin').textContent = adminCount;
    document.getElementById('stat-usuarios-vet').textContent = vetCount;
    document.getElementById('stat-usuarios-recep').textContent = recepCount;
}

async function toggleEstadoUsuario(id, estadoActual) {
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (!confirm(`¿Está seguro de ${accion} este usuario?`)) return;

    try {
        const response = await fetch(`/api/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: nuevoEstado })
        });

        if (!response.ok) throw new Error('Error al cambiar estado');

        showToast('success', 'Éxito', `Usuario ${accion}do correctamente`);
        cargarUsuarios();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', `No se pudo ${accion} el usuario`);
    }
}

async function eliminarUsuario(id) {
    const usuario = usuariosActuales.find(u => u.id === id);

    if (!usuario) return;

    const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
    if (usuarioActual && usuarioActual.id === id) {
        showToast('error', 'Error', 'No puedes eliminar tu propia cuenta');
        return;
    }

    if (!confirm(`¿Está seguro de eliminar al usuario "${usuario.nombreUsuario}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar usuario');

        showToast('success', 'Eliminado', 'Usuario eliminado correctamente');
        cargarUsuarios();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudo eliminar el usuario');
    }
}

function filtrarUsuarios() {
    const filtro = document.getElementById('filtroEstadoUsuarios').value;
    const busqueda = document.getElementById('busquedaUsuarios').value.toLowerCase();

    let usuariosFiltrados = usuariosActuales.filter(u => u.rol !== 'CLIENTE');

    if (filtro === 'activos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.activo);
    } else if (filtro === 'inactivos') {
        usuariosFiltrados = usuariosFiltrados.filter(u => !u.activo);
    }

    if (busqueda) {
        usuariosFiltrados = usuariosFiltrados.filter(u =>
            u.correoElectronico.toLowerCase().includes(busqueda) ||
            u.rol.toLowerCase().includes(busqueda) ||
            (u.trabajador &&
             `${u.trabajador.nombre} ${u.trabajador.apellido}`.toLowerCase().includes(busqueda))
        );
    }

    const tbody = document.querySelector('#tabla-usuarios tbody');
    tbody.innerHTML = '';

    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-gray-500">
                    No se encontraron usuarios con los filtros aplicados
                </td>
            </tr>
        `;
        return;
    }

    usuariosFiltrados.forEach(usuario => {
        const estadoBadge = usuario.activo
            ? '<span class="status-badge status-active">Activo</span>'
            : '<span class="status-badge status-inactive">Inactivo</span>';

        const trabajadorInfo = usuario.trabajador
            ? `${usuario.trabajador.nombre} ${usuario.trabajador.apellido}`
            : 'Sin asignar';

        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-200 hover:bg-gray-50 transition';
        tr.innerHTML = `
            <td class="py-3 px-4">${usuario.correoElectronico}</td>
            <td class="py-3 px-4">${usuario.rol}</td>
            <td class="py-3 px-4">${trabajadorInfo}</td>
            <td class="py-3 px-4 text-center">${estadoBadge}</td>
            <td class="py-3 px-4 text-center">
                <button onclick="toggleEstadoUsuario(${usuario.id}, ${usuario.activo})"
                        class="text-${usuario.activo ? 'orange' : 'green'}-500 hover:text-${usuario.activo ? 'orange' : 'green'}-700 mr-3"
                        title="${usuario.activo ? 'Desactivar' : 'Activar'}">
                    <i class="fas fa-${usuario.activo ? 'ban' : 'check-circle'} text-lg"></i>
                </button>
                <button onclick="eliminarUsuario(${usuario.id})"
                        class="text-red-500 hover:text-red-700"
                        title="Eliminar">
                    <i class="fas fa-trash text-lg"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'usuarios' &&
                mutation.target.classList.contains('active')) {
                cargarUsuarios();
            }
        });
    });

    const moduloUsuarios = document.getElementById('usuarios');
    if (moduloUsuarios) {
        observer.observe(moduloUsuarios, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});
