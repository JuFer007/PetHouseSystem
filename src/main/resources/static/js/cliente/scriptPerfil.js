let clienteActual = null;

async function verificarSesionCliente() {
    try {
        const response = await fetch('/api/usuarios/session', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/login';
            return null;
        }

        const data = await response.json();

        if (data.rol !== 'CLIENTE') {
            showToast('error', 'Acceso denegado', 'Solo clientes pueden acceder');
            setTimeout(() => window.location.href = '/', 2000);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/login';
        return null;
    }
}

async function cargarDatosCliente() {
    const usuario = await verificarSesionCliente();
    if (!usuario) return;

    try {
        // Buscar cliente por DNI del trabajador asociado
        const response = await fetch(`/api/clientes/dni/${usuario.trabajador.dni}`);

        if (!response.ok) throw new Error('Cliente no encontrado');

        clienteActual = await response.json();

        document.getElementById('nombreCliente').textContent = `${clienteActual.nombre} ${clienteActual.apellido}`;
        document.getElementById('dniCliente').textContent = `DNI: ${clienteActual.dni}`;
        document.getElementById('telefonoCliente').textContent = `Teléfono: ${clienteActual.telefono || 'No registrado'}`;

        cargarCitas();
        cargarMascotas();
        cargarCompras();
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Error', 'No se pudieron cargar los datos del cliente');
    }
}

function cambiarTab(tab) {
    document.getElementById('contenidoCitas').classList.add('hidden');
    document.getElementById('contenidoMascotas').classList.add('hidden');
    document.getElementById('contenidoCompras').classList.add('hidden');

    document.getElementById('tabCitas').classList.remove('border-cyan-500', 'text-cyan-500');
    document.getElementById('tabMascotas').classList.remove('border-cyan-500', 'text-cyan-500');
    document.getElementById('tabCompras').classList.remove('border-cyan-500', 'text-cyan-500');

    // Activar el seleccionado
    if (tab === 'citas') {
        document.getElementById('contenidoCitas').classList.remove('hidden');
        document.getElementById('tabCitas').classList.add('border-cyan-500', 'text-cyan-500');
    } else if (tab === 'mascotas') {
        document.getElementById('contenidoMascotas').classList.remove('hidden');
        document.getElementById('tabMascotas').classList.add('border-cyan-500', 'text-cyan-500');
    } else if (tab === 'compras') {
        document.getElementById('contenidoCompras').classList.remove('hidden');
        document.getElementById('tabCompras').classList.add('border-cyan-500', 'text-cyan-500');
    }
}

async function cargarCitas() {
    if (!clienteActual) return;

    try {
        const response = await fetch('/api/citas');
        const todasCitas = await response.json();

        const citasCliente = todasCitas.filter(c => c.cliente?.id === clienteActual.id);

        const lista = document.getElementById('listaCitas');
        lista.innerHTML = '';

        if (citasCliente.length === 0) {
            lista.innerHTML = '<p class="text-gray-500 text-center col-span-2">No tienes citas registradas</p>';
            return;
        }

        citasCliente.forEach(cita => {
            const estadoClass = cita.estado === 'COMPLETADA' ? 'bg-green-100 text-green-800' :
                               cita.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-red-100 text-red-800';

            const card = document.createElement('div');
            card.className = 'bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition';
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-bold text-lg text-gray-800">${cita.servicio?.nombre || 'Consulta'}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${estadoClass}">
                        ${cita.estado}
                    </span>
                </div>
                <div class="space-y-2 text-sm text-gray-600">
                    <p><i class="fas fa-paw text-cyan-500 mr-2"></i>${cita.mascota?.nombre || '-'}</p>
                    <p><i class="fas fa-calendar text-cyan-500 mr-2"></i>${new Date(cita.fecha).toLocaleDateString()}</p>
                    <p><i class="fas fa-clock text-cyan-500 mr-2"></i>${cita.hora || '-'}</p>
                    ${cita.motivo ? `<p><i class="fas fa-comment text-cyan-500 mr-2"></i>${cita.motivo}</p>` : ''}
                </div>
            `;
            lista.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarMascotas() {
    if (!clienteActual) return;

    try {
        const response = await fetch(`/api/mascotas/cliente/${clienteActual.id}`);
        const mascotas = await response.json();

        const lista = document.getElementById('listaMascotas');
        lista.innerHTML = '';

        if (mascotas.length === 0) {
            lista.innerHTML = '<p class="text-gray-500 text-center col-span-3">No tienes mascotas registradas</p>';
            return;
        }

        mascotas.forEach(mascota => {
            const card = document.createElement('div');
            card.className = 'bg-white border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition';
            card.innerHTML = `
                <div class="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i class="fas fa-paw text-3xl text-white"></i>
                </div>
                <h3 class="font-bold text-lg text-gray-800 mb-2">${mascota.nombre}</h3>
                <p class="text-gray-600 text-sm mb-1">${mascota.especie}</p>
                <p class="text-gray-500 text-xs">Raza: ${mascota.raza || 'N/A'}</p>
                <p class="text-gray-500 text-xs">Edad: ${mascota.edad || 0} años</p>
            `;
            lista.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarCompras() {
    if (!clienteActual) return;

    try {
        const response = await fetch(`/api/ventas/cliente/${clienteActual.id}`);
        const compras = await response.json();

        const lista = document.getElementById('listaCompras');
        lista.innerHTML = '';

        if (compras.length === 0) {
            lista.innerHTML = '<p class="text-gray-500 text-center">No tienes compras registradas</p>';
            return;
        }

        compras.forEach(compra => {
            const card = document.createElement('div');
            card.className = 'bg-white border rounded-xl p-6 shadow-sm';

            const productos = compra.detalles.map(d =>
                `<li>${d.producto.nombre} x${d.cantidad} - S/. ${d.subtotal.toFixed(2)}</li>`
            ).join('');

            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">Compra #${compra.id}</h3>
                        <p class="text-sm text-gray-600">${new Date(compra.fechaVenta).toLocaleString()}</p>
                    </div>
                    <span class="text-xl font-bold text-cyan-500">S/. ${compra.total.toFixed(2)}</span>
                </div>
                <div class="border-t pt-4">
                    <p class="font-semibold text-gray-700 mb-2">Productos:</p>
                    <ul class="text-sm text-gray-600 space-y-1">${productos}</ul>
                </div>
                <div class="mt-4 text-sm text-gray-500">
                    <i class="fas fa-credit-card mr-2"></i>Método: ${compra.metodoPago}
                </div>
            `;
            lista.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cerrarSesion() {
    try {
        await fetch('/api/usuarios/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        localStorage.clear();
        window.location.href = '/';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosCliente();
});