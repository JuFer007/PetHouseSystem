// ==================== GESTIÓN DE SESIÓN ====================
async function verificarSesionCliente() {
    try {
        const response = await fetch('/api/usuarios/session', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const usuario = await response.json();

            if (usuario.rol === 'CLIENTE' && usuario.cliente) {
                mostrarInterfazLogueada(usuario);
                return usuario;
            }
        }

        mostrarInterfazNoLogueada();
        return null;
    } catch (error) {
        console.error('Error verificando sesión:', error);
        mostrarInterfazNoLogueada();
        return null;
    }
}

function mostrarInterfazLogueada(usuario) {
    // Ocultar botón login
    const btnLogin = document.getElementById('btnUsuarioNav');
    const btnLoginMobile = document.getElementById('btnUsuarioNavMobile');

    if (btnLogin) btnLogin.style.display = 'none';
    if (btnLoginMobile) btnLoginMobile.style.display = 'none';

    // Mostrar perfil y cerrar sesión
    const navPerfil = document.getElementById('navPerfil');
    const navPerfilMobile = document.getElementById('navPerfilMobile');
    const btnCerrar = document.getElementById('btnCerrarSesion');
    const btnCerrarMobile = document.getElementById('btnCerrarSesionMobile');

    if (navPerfil) navPerfil.style.display = 'block';
    if (navPerfilMobile) navPerfilMobile.style.display = 'block';
    if (btnCerrar) btnCerrar.style.display = 'block';
    if (btnCerrarMobile) btnCerrarMobile.style.display = 'block';

    // Guardar datos en localStorage
    localStorage.setItem('clienteId', usuario.cliente.id);
    localStorage.setItem('clienteData', JSON.stringify(usuario.cliente));
}

function mostrarInterfazNoLogueada() {
    const btnLogin = document.getElementById('btnUsuarioNav');
    const btnLoginMobile = document.getElementById('btnUsuarioNavMobile');

    if (btnLogin) btnLogin.style.display = 'block';
    if (btnLoginMobile) btnLoginMobile.style.display = 'block';

    const navPerfil = document.getElementById('navPerfil');
    const navPerfilMobile = document.getElementById('navPerfilMobile');
    const btnCerrar = document.getElementById('btnCerrarSesion');
    const btnCerrarMobile = document.getElementById('btnCerrarSesionMobile');

    if (navPerfil) navPerfil.style.display = 'none';
    if (navPerfilMobile) navPerfilMobile.style.display = 'none';
    if (btnCerrar) btnCerrar.style.display = 'none';
    if (btnCerrarMobile) btnCerrarMobile.style.display = 'none';
}

async function cerrarSesionCliente() {
    try {
        await fetch('/api/usuarios/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    } finally {
        localStorage.removeItem('clienteId');
        localStorage.removeItem('clienteData');
        mostrarInterfazNoLogueada();
        window.location.href = '/';
    }
}

// ==================== TABS DEL PERFIL ====================
function cambiarTabPerfil(tab) {
    // Actualizar botones
    document.querySelectorAll('[id^="tabPerfil"]').forEach(btn => {
        btn.className = 'flex-1 py-4 text-center font-semibold transition text-gray-600 hover:text-cyan-500';
    });

    document.getElementById(`tabPerfil${tab.charAt(0).toUpperCase() + tab.slice(1)}`)
        .className = 'flex-1 py-4 text-center font-semibold transition border-b-2 border-cyan-500 text-cyan-500';

    // Actualizar contenido
    document.getElementById('contenidoPerfilCitas').classList.add('hidden');
    document.getElementById('contenidoPerfilMascotas').classList.add('hidden');
    document.getElementById('contenidoPerfilCompras').classList.add('hidden');

    document.getElementById(`contenidoPerfil${tab.charAt(0).toUpperCase() + tab.slice(1)}`)
        .classList.remove('hidden');
}

// ==================== CARGAR PERFIL ====================
async function cargarPerfilCompleto() {
    const usuario = await verificarSesionCliente();

    if (!usuario || !usuario.cliente) {
        showToast('warning', 'Inicia sesión', 'Debes iniciar sesión para ver tu perfil');
        window.location.hash = '#inicio';
        return;
    }

    const cliente = usuario.cliente;

    // Llenar datos del header
    document.getElementById('nombreClientePerfil').textContent =
        `${cliente.nombre} ${cliente.apellido}`;
    document.getElementById('correoClientePerfil').textContent = usuario.correoElectronico;
    document.getElementById('dniClientePerfil').textContent = `DNI: ${cliente.dni}`;
    document.getElementById('telefonoClientePerfil').textContent =
        `Teléfono: ${cliente.telefono || 'No registrado'}`;

    // Cargar datos de cada tab
    await cargarCitasPerfil(cliente.id);
    await cargarMascotasPerfil(cliente.id);
    await cargarComprasPerfil(cliente.id);
}

// ==================== CARGAR CITAS ====================
async function cargarCitasPerfil(clienteId) {
    const container = document.getElementById('listaPerfilCitas');

    try {
        // Primero obtener las mascotas del cliente
        const resMascotas = await fetch(`/api/mascotas/cliente/${clienteId}`);
        const mascotas = await resMascotas.json();

        if (mascotas.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-12">
                    <i class="fas fa-calendar-times text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No tienes mascotas registradas</p>
                </div>
            `;
            return;
        }

        // Obtener citas de todas las mascotas
        const promesas = mascotas.map(m =>
            fetch(`/api/citas/mascota/${m.id}`).then(r => r.json())
        );

        const resultados = await Promise.all(promesas);
        const todasLasCitas = resultados.flat();

        if (todasLasCitas.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center py-12">
                    <i class="fas fa-calendar-times text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No tienes citas agendadas</p>
                    <button onclick="window.location.hash='#servicios'"
                        class="mt-4 btn-primary px-6 py-2 rounded-lg">
                        Agendar Cita
                    </button>
                </div>
            `;
            return;
        }

        // Ordenar por fecha
        todasLasCitas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        container.innerHTML = todasLasCitas.map(cita => `
            <div class="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">${cita.mascota?.nombre || 'Mascota'}</h3>
                        <p class="text-sm text-gray-600">${cita.servicio?.nombre || cita.motivo || 'Consulta'}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                        cita.estado === 'COMPLETADA' ? 'bg-green-100 text-green-800' :
                        cita.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }">
                        ${cita.estado}
                    </span>
                </div>
                <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex items-center">
                        <i class="fas fa-calendar mr-2 text-cyan-500"></i>
                        <span>${new Date(cita.fecha).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-clock mr-2 text-cyan-500"></i>
                        <span>${cita.hora || 'No especificada'}</span>
                    </div>
                    ${cita.servicio ? `
                    <div class="flex items-center">
                        <i class="fas fa-dollar-sign mr-2 text-cyan-500"></i>
                        <span>S/. ${cita.servicio.precio.toFixed(2)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error cargando citas:', error);
        container.innerHTML = `
            <div class="col-span-2 text-center py-12 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>Error al cargar las citas</p>
            </div>
        `;
    }
}

// ==================== CARGAR MASCOTAS ====================
async function cargarMascotasPerfil(clienteId) {
    const container = document.getElementById('listaPerfilMascotas');

    try {
        const response = await fetch(`/api/mascotas/cliente/${clienteId}`);
        const mascotas = await response.json();

        if (mascotas.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-12">
                    <i class="fas fa-paw text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No tienes mascotas registradas</p>
                </div>
            `;
            return;
        }

        container.innerHTML = mascotas.map(mascota => `
            <div class="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-paw text-3xl text-white"></i>
                </div>
                <h3 class="font-bold text-xl text-gray-800 mb-2">${mascota.nombre}</h3>
                <div class="space-y-1 text-sm text-gray-600">
                    <p><i class="fas fa-dog mr-2 text-cyan-500"></i>${mascota.especie}</p>
                    <p><i class="fas fa-dna mr-2 text-cyan-500"></i>${mascota.raza}</p>
                    <p><i class="fas fa-birthday-cake mr-2 text-cyan-500"></i>${mascota.edad} ${mascota.edad === 1 ? 'año' : 'años'}</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error cargando mascotas:', error);
        container.innerHTML = `
            <div class="col-span-3 text-center py-12 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>Error al cargar las mascotas</p>
            </div>
        `;
    }
}

// ==================== CARGAR COMPRAS ====================
async function cargarComprasPerfil(clienteId) {
    const container = document.getElementById('listaPerfilCompras');

    try {
        const response = await fetch(`/api/ventas/cliente/${clienteId}`);
        const ventas = await response.json();

        if (ventas.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-bag text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No tienes compras registradas</p>
                    <button onclick="window.location.hash='#productos'"
                        class="mt-4 btn-primary px-6 py-2 rounded-lg">
                        Ver Productos
                    </button>
                </div>
            `;
            return;
        }

        // Ordenar por fecha descendente
        ventas.sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta));

        container.innerHTML = ventas.map(venta => `
            <div class="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">Orden #${venta.id}</h3>
                        <p class="text-sm text-gray-600">
                            ${new Date(venta.fechaVenta).toLocaleDateString('es-PE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <span class="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold">
                        S/. ${venta.total.toFixed(2)}
                    </span>
                </div>
                <div class="space-y-2">
                    <p class="text-sm text-gray-600 font-semibold">Productos:</p>
                    ${venta.detalles.map(detalle => `
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-700">${detalle.producto.nombre} x${detalle.cantidad}</span>
                            <span class="text-gray-600">S/. ${detalle.subtotal.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span class="text-sm text-gray-600">
                        <i class="fas fa-credit-card mr-2"></i>${venta.metodoPago}
                    </span>
                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Completado
                    </span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error cargando compras:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>Error al cargar las compras</p>
            </div>
        `;
    }
}

// ==================== NAVEGACIÓN AL PERFIL ====================
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#perfil') {
        document.getElementById('perfil').style.display = 'block';
        cargarPerfilCompleto();
    } else {
        document.getElementById('perfil').style.display = 'none';
    }
});

// ==================== LISTENERS DE BOTONES ====================
document.getElementById('btnUsuarioNav')?.addEventListener('click', () => {
    window.location.href = '/login';
});

document.getElementById('btnUsuarioNavMobile')?.addEventListener('click', () => {
    window.location.href = '/login';
});

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async () => {
    await verificarSesionCliente();

    if (window.location.hash === '#perfil') {
        document.getElementById('perfil').style.display = 'block';
        await cargarPerfilCompleto();
    }
});
