let clienteActual = null;

//Función para cargar clientes
async function cargarClientes() {
    try {
        const response = await fetch('/api/clientes/clienteMascota');
        const clientes = await response.json();

        const tbody = document.querySelector('#tabla-clientes tbody');
        tbody.innerHTML = '';

        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.classList.add('table-row', 'border-b', 'border-gray-200');

            const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
            const nombresMascotas = cliente.mascotas.map(m => m.nombre).join(', ');

            row.innerHTML = `
                <td class="py-4 px-4">${nombreCompleto}</td>
                <td class="py-4 px-4">${cliente.dni}</td>
                <td class="py-4 px-4">${cliente.telefono || 'Sin teléfono'}</td>
                <td class="py-4 px-4">${nombresMascotas}</td>
                <td class="py-4 px-4">${cliente.mascotas.length}</td>
                <td class="py-4 px-4 text-center">
                    <button class="text-blue-500 hover:text-blue-700 mr-2" onclick="abrirModalEditar(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-500 hover:text-red-700" onclick="eliminarCliente(${cliente.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

//Función para abrir el modal
function abrirModalEditar(id) {
    console.log('Abriendo modal para cliente ID:', id);
    fetch(`/api/clientes/${id}`)
        .then(res => res.json())
        .then(cliente => {
            clienteActual = cliente;
            document.getElementById('editarNombre').value = cliente.nombre;
            document.getElementById('editarApellido').value = cliente.apellido;
            document.getElementById('editarDni').value = cliente.dni;
            document.getElementById('editarTelefono').value = cliente.telefono || '';

            const modal = document.getElementById('modalEditarCliente');
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        })
        .catch(err => console.error('Error al cargar cliente:', err));
}

//Función para cerrar el modal
function cerrarModalEditar() {
    console.log('Cerrando modal');
    const modal = document.getElementById('modalEditarCliente');
    const inputTelefono = document.getElementById('editarTelefono');
    const errorTelefono = document.getElementById('errorTelefono');

    modal.classList.add('hidden');
    modal.style.display = 'none';
    clienteActual = null;

    if (errorTelefono) errorTelefono.classList.add('hidden');
    if (inputTelefono) inputTelefono.classList.remove('border-red-500');
}

//Función para eliminar cliente
function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        fetch(`/api/clientes/${id}`, { method: 'DELETE' })
            .then(() => {
                cargarClientes();
                if (typeof showToast === 'function') {
                    showToast("success", "Cliente eliminado", "El cliente se eliminó correctamente.");
                }
            })
            .catch(err => console.error('Error al eliminar:', err));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando...');

    // Cargar clientes
    cargarClientes();

    //Botón X para cerrar
    const btnCerrarX = document.getElementById('btnCerrarX');
    if (btnCerrarX) {
        btnCerrarX.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Click en X');
            cerrarModalEditar();
        });
    }

    //Botón Cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Click en Cancelar');
            cerrarModalEditar();
        });
    }

    //Cerrar al hacer clic fuera del modal
    const modal = document.getElementById('modalEditarCliente');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.id === 'modalEditarCliente') {
                console.log('Click fuera del modal');
                cerrarModalEditar();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modalEditarCliente');
            if (modal && !modal.classList.contains('hidden')) {
                console.log('Tecla ESC presionada');
                cerrarModalEditar();
            }
        }
    });

    //Validación en tiempo real del teléfono
    const inputTelefono = document.getElementById('editarTelefono');
    const errorTelefono = document.getElementById('errorTelefono');

    if (inputTelefono) {
        inputTelefono.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');

            if (this.value.length > 0 && this.value.length !== 9) {
                errorTelefono.classList.remove('hidden');
                this.classList.add('border-red-500');
            } else {
                errorTelefono.classList.add('hidden');
                this.classList.remove('border-red-500');
            }
        });
    }

    //Submit del formulario
    const form = document.getElementById('formEditarCliente');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('Formulario enviado');

            if (!clienteActual) {
                console.error('No hay cliente seleccionado');
                return;
            }

            const telefono = document.getElementById('editarTelefono').value.trim();

            //Validar teléfono antes de enviar
            if (telefono.length === 0) {
                errorTelefono.textContent = 'El teléfono es requerido';
                errorTelefono.classList.remove('hidden');
                inputTelefono.classList.add('border-red-500');
                inputTelefono.focus();
                return;
            }

            if (telefono.length !== 9) {
                errorTelefono.textContent = 'Debe ingresar exactamente 9 dígitos';
                errorTelefono.classList.remove('hidden');
                inputTelefono.classList.add('border-red-500');
                inputTelefono.focus();
                return;
            }

            if (!/^[0-9]{9}$/.test(telefono)) {
                errorTelefono.textContent = 'Solo se permiten números';
                errorTelefono.classList.remove('hidden');
                inputTelefono.classList.add('border-red-500');
                inputTelefono.focus();
                return;
            }

            console.log('Actualizando teléfono a:', telefono);

            //Actualizar cliente
            fetch(`/api/clientes/${clienteActual.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...clienteActual, telefono })
            })
            .then(res => {
                console.log('Respuesta recibida:', res.status);
                if (!res.ok) throw new Error('Error al actualizar');
                return res.json();
            })
            .then(data => {
                console.log('Cliente actualizado exitosamente:', data);
                cerrarModalEditar();
                cargarClientes();

                if (typeof showToast === 'function') {
                    showToast("success", "Cliente actualizado", `Teléfono actualizado correctamente.`);
                }
            })
            .catch(err => {
                console.error('Error al actualizar cliente:', err);
                cerrarModalEditar();
                if (typeof showToast === 'function') {
                    showToast("error", "Error", "No se pudo actualizar el cliente.");
                }
            });
        });
    } else {
        console.error('No se encontró el formulario');
    }
});
