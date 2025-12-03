// ==================== Verificar sesión ====================
async function verificarAutenticacion() {
    try {
        const response = await fetch('/api/usuarios/session', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const data = await response.json();
        localStorage.setItem('usuario', JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        window.location.href = '/login';
    }
}

// ==================== Cargar datos del usuario en el dropdown ====================
function cargarDatosUsuario() {
    const usuarioData = localStorage.getItem('usuario');
    if (!usuarioData) {
        window.location.href = '/login';
        return;
    }

    const usuario = JSON.parse(usuarioData);

    const avatar = document.getElementById('user-avatar');
    const nombre = document.getElementById('user-name');
    const rol = document.getElementById('user-role');

    if (avatar && nombre && rol) {
        let nombreCompleto = "Usuario";
        let iniciales = "??";
        let cargo = usuario.rol;

        if (usuario.trabajador) {
            nombreCompleto = `${usuario.trabajador.nombre} ${usuario.trabajador.apellido}`;
            iniciales = `${usuario.trabajador.nombre.charAt(0)}${usuario.trabajador.apellido.charAt(0)}`;
            cargo = usuario.rol;
        }

        avatar.src = `https://ui-avatars.com/api/?name=${iniciales}&background=00CED1&color=fff`;
        avatar.alt = nombreCompleto;
        nombre.textContent = nombreCompleto;
        rol.textContent = cargo;
    }

    console.log('Usuario logueado:', usuario);
}

// ==================== Cerrar sesión ====================
async function cerrarSesion() {
    try {
        await fetch('/api/usuarios/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    } finally {
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    }
}

// ==================== Utilidades ====================
function obtenerUsuarioActual() {
    const usuarioData = localStorage.getItem('usuario');
    return usuarioData ? JSON.parse(usuarioData) : null;
}

function verificarRol(rolesPermitidos) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;
    return rolesPermitidos.includes(usuario.rol);
}

// ==================== Inicialización ====================
document.addEventListener('DOMContentLoaded', async () => {
    await verificarAutenticacion();
    cargarDatosUsuario();
});

// Exponer funciones globalmente
window.cerrarSesion = cerrarSesion;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.verificarRol = verificarRol;
